import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { RemoveTagFromPostUseCase } from './remove-tag-from-post.use-case';
import { PostRepository } from '../../domain/repositories/post.repository';
import { TagRepository } from '../../../tags/domain/repositories/tag.repository';
import { PostEntity } from '../../domain/entities/post.entity';
import { TagEntity } from '../../../tags/domain/entities/tag.entity';
import { UserEntity } from '../../../users/domain/entities/user.entity';

describe('RemoveTagFromPostUseCase', () => {
    let useCase: RemoveTagFromPostUseCase;
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
        useCase = new RemoveTagFromPostUseCase(postRepository, tagRepository);
    });

    it('should successfully remove a tag from a post', async () => {
        const user = UserEntity.create('user1', 'writer', 'pw');
        const post = PostEntity.create('title', 'content', user.id);
        const tag = TagEntity.create('nodejs');
        post.addTag({ id: tag.id, name: tag.name });

        postRepository.getPostById.mockResolvedValue(post);
        tagRepository.findById.mockResolvedValue(tag);
        postRepository.updatePost.mockResolvedValue();

        await useCase.execute(post.id, tag.id, user);

        expect(post.tags).toHaveLength(0);
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

    it('should throw NotFoundException if tag is not linked to post', async () => {
        const user = UserEntity.create('user1', 'writer', 'pw');
        const post = PostEntity.create('title', 'content', user.id); // no tags
        const tag = TagEntity.create('nodejs');

        postRepository.getPostById.mockResolvedValue(post);
        tagRepository.findById.mockResolvedValue(tag);

        await expect(useCase.execute(post.id, tag.id, user)).rejects.toThrow(NotFoundException);
    });
});
