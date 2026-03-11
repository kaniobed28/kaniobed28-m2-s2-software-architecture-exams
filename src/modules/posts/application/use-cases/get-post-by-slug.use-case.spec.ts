import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { GetPostBySlugUseCase } from './get-post-by-slug.use-case';
import { PostRepository } from '../../domain/repositories/post.repository';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { PostEntity } from '../../domain/entities/post.entity';

describe('GetPostBySlugUseCase', () => {
    let useCase: GetPostBySlugUseCase;
    let postRepository: jest.Mocked<PostRepository>;

    beforeEach(() => {
        postRepository = {
            getPosts: jest.fn(),
            getPostById: jest.fn(),
            getPostBySlug: jest.fn(),
            createPost: jest.fn(),
            updatePost: jest.fn(),
            deletePost: jest.fn(),
        };
        useCase = new GetPostBySlugUseCase(postRepository);
    });

    it('should find returning the expected post by slug', async () => {
        const user = UserEntity.create('1', 'writer', 'pass');
        const post = PostEntity.create('title', 'content', user.id, 'sluggy');
        (post as any)._status = 'accepted';

        postRepository.getPostBySlug.mockResolvedValue(post);

        const result = await useCase.execute('sluggy');
        expect(result.id).toBe(post.id);
    });

    it('should return a non-accepted post if exact author request', async () => {
        const author = UserEntity.create('1', 'writer', 'pass');
        const post = PostEntity.create('title', 'content', author.id, 'sluggy');
        // Default is draft

        postRepository.getPostBySlug.mockResolvedValue(post);
        const result = await useCase.execute('sluggy', author);
        expect(result.id).toEqual(post.id);
    });

    it('should return a non-accepted post for admin requests', async () => {
        const author = UserEntity.create('1', 'writer', 'pass');
        const admin = UserEntity.create('2', 'admin', 'pass');
        const post = PostEntity.create('title', 'content', author.id, 'sluggy');

        postRepository.getPostBySlug.mockResolvedValue(post);
        const result = await useCase.execute('sluggy', admin);
        expect(result.id).toEqual(post.id);
    });

    it('should throw ForbiddenException if user tries to view draft post but is not author', async () => {
        const author = UserEntity.create('1', 'writer', 'pass');
        const other = UserEntity.create('2', 'writer', 'pass');
        const post = PostEntity.create('title', 'content', author.id, 'sluggy');

        postRepository.getPostBySlug.mockResolvedValue(post);
        await expect(useCase.execute('sluggy', other)).rejects.toThrow(ForbiddenException);
        await expect(useCase.execute('sluggy', undefined)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if slug matches absolutely no post', async () => {
        postRepository.getPostBySlug.mockResolvedValue(undefined);
        await expect(useCase.execute('void-slug')).rejects.toThrow(NotFoundException);
    });
});
