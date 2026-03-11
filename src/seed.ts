import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserRepository } from './modules/users/domain/repositories/user.repository';
import { UserEntity } from './modules/users/domain/entities/user.entity';
import { PostRepository } from './modules/posts/domain/repositories/post.repository';
import { PostEntity } from './modules/posts/domain/entities/post.entity';
import { TagRepository, TAG_REPOSITORY_TOKEN } from './modules/tags/domain/repositories/tag.repository';
import { TagEntity } from './modules/tags/domain/entities/tag.entity';
import { CommentRepository } from './modules/comments/domain/repositories/comment.repository';
import { CommentEntity } from './modules/comments/domain/entities/comment.entity';
import { FollowRepository } from './modules/subscriptions/domain/repositories/follow.repository';
import { FollowEntity } from './modules/subscriptions/domain/entities/follow.entity';
import { AddTagToPostUseCase } from './modules/posts/application/use-cases/add-tag-to-post.use-case';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
    process.env.NODE_ENV = 'development';
    
    // Clear existing DB to have a fresh state
    const dbDir = path.join(__dirname, '..', 'db');
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir);
    }
    const dbPath = path.join(dbDir, 'database.sqlite');
    if (fs.existsSync(dbPath)) {
        console.log('Clearing existing database...');
        try { fs.unlinkSync(dbPath); } catch (e) {
            console.error('Failed to delete old DB, but will proceed', e);
        }
    }
    
    const app = await NestFactory.createApplicationContext(AppModule);
    
    const userRepository = app.get<UserRepository>(UserRepository);
    const postRepository = app.get<PostRepository>(PostRepository);
    const tagRepository = app.get<TagRepository>(TAG_REPOSITORY_TOKEN);
    const commentRepository = app.get<CommentRepository>(CommentRepository);
    const followRepository = app.get<FollowRepository>(FollowRepository);
    const addTagToPostUseCase = app.get<AddTagToPostUseCase>(AddTagToPostUseCase);

    console.log('Seed: Creating users...');
    const admin = UserEntity.create('admin_user', 'admin', 'password123');
    const moderator = UserEntity.create('mod_user', 'moderator', 'password123');
    const writer = UserEntity.create('writer_user', 'writer', 'password123');
    const user = UserEntity.create('normal_user', 'user', 'password123');

    await userRepository.createUser(admin);
    await userRepository.createUser(moderator);
    await userRepository.createUser(writer);
    await userRepository.createUser(user);

    console.log('Seed: Creating tags...');
    const tagTech = TagEntity.create('technology');
    const tagScience = TagEntity.create('science');
    const tagLife = TagEntity.create('lifestyle');

    await tagRepository.save(tagTech);
    await tagRepository.save(tagScience);
    await tagRepository.save(tagLife);

    console.log('Seed: Creating posts...');
    const post1Draft = PostEntity.create('The Future of AI', 'Artificial intelligence is fundamentally transforming the world layout.', writer.id);
    post1Draft.updateSlug('the-future-of-ai');
    const post1 = PostEntity.reconstitute({ ...post1Draft.toJSON(), status: 'accepted' });
    await postRepository.createPost(post1);
    
    const post2 = PostEntity.create('Learning Software Architecture', 'Software architecture is the high level structure of software.', writer.id);
    post2.updateSlug('learning-software-architecture');
    await postRepository.createPost(post2); // defaults to draft

    const post3Draft = PostEntity.create('My Rejected Article', 'This is an article that is rejected.', writer.id);
    post3Draft.updateSlug('my-rejected-article');
    const post3 = PostEntity.reconstitute({ ...post3Draft.toJSON(), status: 'rejected' });
    await postRepository.createPost(post3);

    const post4Draft = PostEntity.create('Pending Review Post', 'This post is waiting for review.', writer.id);
    post4Draft.updateSlug('pending-review-post');
    const post4 = PostEntity.reconstitute({ ...post4Draft.toJSON(), status: 'waiting' });
    await postRepository.createPost(post4);

    console.log('Seed: Adding tags to posts...');
    await addTagToPostUseCase.execute(post1.id, tagTech.id, admin); 
    await addTagToPostUseCase.execute(post2.id, tagScience.id, writer);
    await addTagToPostUseCase.execute(post2.id, tagTech.id, writer);

    console.log('Seed: Creating comments...');
    const comment1 = CommentEntity.create(post1.id, user.id, 'Great article on the future!');
    await commentRepository.createComment(comment1);
    
    const comment2 = CommentEntity.create(post1.id, writer.id, 'Thank you for your feedback, user!');
    await commentRepository.createComment(comment2);

    console.log('Seed: Creating subscriptions...');
    const follow = FollowEntity.create(user.id, writer.id);
    await followRepository.addFollow(follow);

    console.log('Seed: Data generated successfully! You can now start the application.');

    await app.close();
}

bootstrap();
