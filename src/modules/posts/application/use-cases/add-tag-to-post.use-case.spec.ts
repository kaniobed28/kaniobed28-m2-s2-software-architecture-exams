import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { AddTagToPostUseCase } from './add-tag-to-post.use-case';
import { PostRepository } from '../../domain/repositories/post.repository';
import { TagRepository } from '../../../tags/domain/repositories/tag.repository';
import { PostEntity } from '../../domain/entities/post.entity';
import { TagEntity } from '../../../tags/domain/entities/tag.entity';
import { UserEntity } from '../../../users/domain/entities/user.entity';

describe('AddTagToPostUseCase', () => {
    let useCase: AddTagToPostUseCase;
    let postRepository: jest.Mocked<PostRepository>;
    let tagRepository: jest.Mocked<TagRepository>;

    beforeEach(() => {
        postRepository = {
            getPosts: jest.fn(),
            getPostById: jest.fn(),
      getPostBySlug: jest.fn(),
            createPost: jest.fn(),
            updatePost: jest.fn(),
            deletePost: jest.fn(),
        };
        tagRepository = {
            findById: jest.fn(),
            findByName: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };
        useCase = new AddTagToPostUseCase(postRepository, tagRepository);
    });

    it('should successfully add a tag to a post', async () => {
        const user = UserEntity.create('user1', 'writer', 'pw');
        const post = PostEntity.create('title', 'content', user.id);
        const tag = TagEntity.create('nodejs');

        postRepository.getPostById.mockResolvedValue(post);
        tagRepository.findById.mockResolvedValue(tag);
        postRepository.updatePost.mockResolvedValue();

        const result = await useCase.execute(post.id, tag.id, user);

        expect(result.tags).toHaveLength(1);
        expect(result.tags[0].name).toBe('nodejs');
        expect(postRepository.updatePost).toHaveBeenCalledWith(post.id, post);
    });

    it('should throw ForbiddenException if user is not author or admin', async () => {
        const author = UserEntity.create('author', 'writer', 'pw');
        const randomUser = UserEntity.create('random', 'writer', 'pw');
        const post = PostEntity.create('title', 'content', author.id);

        postRepository.getPostById.mockResolvedValue(post);

        await expect(useCase.execute(post.id, 'tag1', randomUser)).rejects.toThrow(
            ForbiddenException,
        );
    });

    it('should allow admin to add tags to any post', async () => {
        const author = UserEntity.create('author', 'writer', 'pw');
        const admin = UserEntity.create('admin', 'admin', 'pw');
        const post = PostEntity.create('title', 'content', author.id);
        const tag = TagEntity.create('nodejs');

        postRepository.getPostById.mockResolvedValue(post);
        tagRepository.findById.mockResolvedValue(tag);
        postRepository.updatePost.mockResolvedValue();

        await useCase.execute(post.id, tag.id, admin);
        expect(post.tags).toHaveLength(1);
    });

    it('should throw NotFoundException if post or tag not found', async () => {
        const user = UserEntity.create('user1', 'writer', 'pw');

        postRepository.getPostById.mockResolvedValue(undefined);
        await expect(useCase.execute('invalid', 'tag1', user)).rejects.toThrow(NotFoundException);

        const post = PostEntity.create('title', 'content', user.id);
        postRepository.getPostById.mockResolvedValue(post);
        tagRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(post.id, 'invalid', user)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if tag already exists on post', async () => {
        const user = UserEntity.create('user1', 'writer', 'pw');
        const post = PostEntity.create('title', 'content', user.id);
        const tag = TagEntity.create('nodejs');
        post.addTag({ id: tag.id, name: tag.name }); // already added

        postRepository.getPostById.mockResolvedValue(post);
        tagRepository.findById.mockResolvedValue(tag);

        await expect(useCase.execute(post.id, tag.id, user)).rejects.toThrow(ConflictException);
    });
});
