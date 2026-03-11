import { GetPostsUseCase } from './get-posts.use-case';
import { PostRepository } from '../../domain/repositories/post.repository';
import { LoggingService } from '../../../shared/logging/domain/services/logging.service';
import { PostEntity } from '../../domain/entities/post.entity';
import { UserEntity } from '../../../users/domain/entities/user.entity';

describe('GetPostsUseCase', () => {
    let useCase: GetPostsUseCase;
    let postRepository: jest.Mocked<PostRepository>;
    let loggingService: jest.Mocked<LoggingService>;

    beforeEach(() => {
        postRepository = {
            getPosts: jest.fn(),
            getPostById: jest.fn(),
      getPostBySlug: jest.fn(),
            createPost: jest.fn(),
            updatePost: jest.fn(),
            deletePost: jest.fn(),
        };
        loggingService = {
            log: jest.fn(),
        } as any;
        useCase = new GetPostsUseCase(postRepository, loggingService);
    });

    describe('filtering and authorization logic', () => {
        it('should return all accepted posts for a public observer without user', async () => {
            const publicPost = PostEntity.create('pub', 'pub', 'author1');
            (publicPost as any)._status = 'accepted';

            const draftPost = PostEntity.create('draft', 'draft', 'author1');

            postRepository.getPosts.mockResolvedValue([publicPost, draftPost]);

            const result = await useCase.execute();

            expect(result).toHaveLength(1);
            expect(result[0].toJSON().title).toBe('pub');
        });

        it('should return an authors own post even if draft', async () => {
            const user = UserEntity.create('author1', 'writer', 'pw');
            const authPost = PostEntity.create('auth', 'auth', user.id);
            const randomDraft = PostEntity.create('draft', 'draft', 'anotherAuthor');

            postRepository.getPosts.mockResolvedValue([authPost, randomDraft]);

            const result = await useCase.execute(undefined, user);

            expect(result).toHaveLength(1);
            expect(result[0].toJSON().title).toBe('auth');
        });

        it('should return all posts for admins', async () => {
            const admin = UserEntity.create('admin', 'admin', 'pw');
            const draftPost = PostEntity.create('draft', 'draft', 'author1');

            postRepository.getPosts.mockResolvedValue([draftPost]);

            const result = await useCase.execute(undefined, admin);

            expect(result).toHaveLength(1);
            expect(result[0].toJSON().title).toBe('draft');
        });

        it('should filter posts based on provided tags with OR logic', async () => {
            const admin = UserEntity.create('admin', 'admin', 'pw');
            const post1 = PostEntity.create('post1', 'content', 'author');
            post1.addTag({ id: '1', name: 'nodejs' });

            const post2 = PostEntity.create('post2', 'content', 'author');
            post2.addTag({ id: '2', name: 'react' });

            const post3 = PostEntity.create('post3', 'content', 'author');
            post3.addTag({ id: '3', name: 'python' });

            postRepository.getPosts.mockResolvedValue([post1, post2, post3]);

            const result = await useCase.execute(['nodejs', 'react'], admin);

            expect(result).toHaveLength(2);
            expect(result.some(p => p.toJSON().title === 'post1')).toBe(true);
            expect(result.some(p => p.toJSON().title === 'post2')).toBe(true);
            expect(result.some(p => p.toJSON().title === 'post3')).toBe(false);
        });
    });
});
