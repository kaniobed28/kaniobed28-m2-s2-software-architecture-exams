import { ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { UpdatePostSlugUseCase } from './update-post-slug.use-case';
import { PostRepository } from '../../domain/repositories/post.repository';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { PostEntity } from '../../domain/entities/post.entity';

describe('UpdatePostSlugUseCase', () => {
    let useCase: UpdatePostSlugUseCase;
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
        useCase = new UpdatePostSlugUseCase(postRepository);
    });

    it('should successfully update log', async () => {
        const user = UserEntity.create('user1', 'writer', 'pw');
        const post = PostEntity.create('Initial Title', 'content', user.id, 'initial-title');
        postRepository.getPostById.mockResolvedValue(post);
        postRepository.getPostBySlug.mockResolvedValue(undefined); // Unique logic
        postRepository.updatePost.mockResolvedValue();

        await useCase.execute(post.id, 'new-slug', user);

        expect(post.slug).toBe('new-slug');
        expect(postRepository.updatePost).toHaveBeenCalledWith(post.id, post);
    });

    it('should abort elegantly if slug is the same', async () => {
        const user = UserEntity.create('user1', 'writer', 'pw');
        const post = PostEntity.create('Test', 'Content', user.id, 'same-slug');
        postRepository.getPostById.mockResolvedValue(post);

        await useCase.execute(post.id, 'same-slug', user);
        expect(postRepository.updatePost).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if slug exists for another post', async () => {
        const user = UserEntity.create('user1', 'writer', 'pw');
        const post = PostEntity.create('Title 1', '...', user.id, 'slug-1');
        const existingPostWithRequiredSlug = PostEntity.create('Title 2', '...', user.id, 'slug-2');

        postRepository.getPostById.mockResolvedValue(post);
        postRepository.getPostBySlug.mockResolvedValue(existingPostWithRequiredSlug);

        await expect(useCase.execute(post.id, 'slug-2', user)).rejects.toThrow(ConflictException);
    });

    it('should allow admin to update any post slug', async () => {
        const author = UserEntity.create('user1', 'writer', 'pw');
        const post = PostEntity.create('Title', 'content', author.id, 'old-slug');
        const admin = UserEntity.create('admin', 'admin', 'pw');

        postRepository.getPostById.mockResolvedValue(post);
        postRepository.getPostBySlug.mockResolvedValue(undefined);

        await useCase.execute(post.id, 'admin-slug', admin);

        expect(post.slug).toBe('admin-slug');
        expect(postRepository.updatePost).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not author or admin', async () => {
        const author = UserEntity.create('author', 'writer', 'pw');
        const random = UserEntity.create('random', 'writer', 'pw');
        const post = PostEntity.create('Title', 'content', author.id, 'old-slug');

        postRepository.getPostById.mockResolvedValue(post);

        await expect(useCase.execute(post.id, 'new', random)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if post missing', async () => {
        const user = UserEntity.create('user1', 'writer', 'pw');
        postRepository.getPostById.mockResolvedValue(undefined);
        await expect(useCase.execute('invalid', 'slug', user)).rejects.toThrow(NotFoundException);
    });
});
