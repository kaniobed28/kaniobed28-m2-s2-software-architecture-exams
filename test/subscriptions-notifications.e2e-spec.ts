import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { UserRepository } from './../src/modules/users/domain/repositories/user.repository';
import { UserEntity } from './../src/modules/users/domain/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

describe('Subscriptions & Notifications System (e2e)', () => {
    jest.setTimeout(30000);

    let app: INestApplication<App>;
    let userRepository: UserRepository;
    let authorToken: string;
    let readerToken: string;
    let adminToken: string;

    let authorId: string;
    let readerId: string;

    beforeAll(async () => {
        const dbPath = path.join(__dirname, '..', 'db', 'database.sqlite');
        if (fs.existsSync(dbPath)) {
            try { fs.unlinkSync(dbPath); } catch (e) {}
        }
        process.env.DATABASE_URL = 'db/database.sqlite';

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true }));
        await app.init();

        userRepository = moduleFixture.get<UserRepository>(UserRepository);

        // 1. Create Author
        const author = UserEntity.create('sub_author', 'writer', 'password123');
        await userRepository.createUser(author);

        let res = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ username: 'sub_author', password: 'password123' })
            .expect(201);
        authorToken = res.body.access_token;
        authorId = author.id;

        // 2. Create Reader
        const reader = UserEntity.create('sub_reader', 'user', 'password123');
        await userRepository.createUser(reader);

        res = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ username: 'sub_reader', password: 'password123' })
            .expect(201);
        readerToken = res.body.access_token;
        readerId = reader.id;

        // 3. Create Admin
        const admin = UserEntity.create('sub_admin', 'admin', 'password123');
        await userRepository.createUser(admin);

        res = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ username: 'sub_admin', password: 'password123' })
            .expect(201);
        adminToken = res.body.access_token;
    });

    afterAll(async () => {
        await app.close();
    });

    it('Reader follows Author', async () => {
        await request(app.getHttpServer())
            .post(`/users/${authorId}/follow`)
            .set('Authorization', `Bearer ${readerToken}`)
            .expect(204);

        // Verify followers list
        const res = await request(app.getHttpServer())
            .get(`/users/${authorId}/followers`)
            .expect(200);

        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.some(u => u.id === readerId)).toBeTruthy();
    });

    it('Author creates Post -> Reader receives Notification', async () => {
        // Author creates a post
        const postRes = await request(app.getHttpServer())
            .post('/posts')
            .set('Authorization', `Bearer ${authorToken}`)
            .send({
                title: 'Author New Post',
                slug: 'author-new-post-sn',
                content: 'This is the content.',
                tags: []
            })
            .expect(201);

        // Give the event emitter time to execute asynchronously
        await new Promise(resolve => setTimeout(resolve, 200));

        // Reader checks notifications
        const notifRes = await request(app.getHttpServer())
            .get('/notifications')
            .set('Authorization', `Bearer ${readerToken}`)
            .expect(200);

        expect(notifRes.body).toBeInstanceOf(Array);
        expect(notifRes.body.length).toBeGreaterThanOrEqual(1);
        const notif = notifRes.body.find(n => n.type === 'POST_PENDING_REVIEW' && n.metadata.authorId === authorId);
        expect(notif).toBeDefined();
        expect(notif.isRead).toBe(false);

        // Reader marks it as read
        await request(app.getHttpServer())
            .patch(`/notifications/${notif.id}/read`)
            .set('Authorization', `Bearer ${readerToken}`)
            .expect(204);
    });
});
