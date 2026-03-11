import { NotFoundException } from '@nestjs/common';
import { GetCommentsForPostUseCase } from './get-comments-for-post.use-case';
import { CommentRepository } from '../../domain/repositories/comment.repository';
import { PostRepository } from '../../../posts/domain/repositories/post.repository';
import { PostEntity } from '../../../posts/domain/entities/post.entity';
import { CommentEntity } from '../../domain/entities/comment.entity';

describe('GetCommentsForPostUseCase', () => {
    let useCase: GetCommentsForPostUseCase;
    let commentRepository: jest.Mocked<CommentRepository>;
    let postRepository: jest.Mocked<PostRepository>;

    beforeEach(() => {
        commentRepository = {
            getCommentsForPost: jest.fn(),
            getCommentCountForPost: jest.fn(),
            getCommentById: jest.fn(),
            createComment: jest.fn(),
            updateComment: jest.fn(),
            deleteComment: jest.fn(),
        };
        postRepository = {
            getPosts: jest.fn(),
            getPostById: jest.fn(),
            getPostBySlug: jest.fn(),
            createPost: jest.fn(),
            updatePost: jest.fn(),
            deletePost: jest.fn(),
        };
        useCase = new GetCommentsForPostUseCase(commentRepository, postRepository);
    });

    it('should retrieve comments for post', async () => {
        const post = PostEntity.create('Valid Title', 'Valid Content', 'id');
        const comment = CommentEntity.create('yep', 'a', post.id);

        postRepository.getPostById.mockResolvedValue(post);
        commentRepository.getCommentsForPost.mockResolvedValue([[comment], 1]);

        const result = await useCase.execute(post.id);
        expect(result.comments).toHaveLength(1);
        expect(result.comments[0].id).toBe(comment.id);
        expect(result.total).toBe(1);
        expect(commentRepository.getCommentsForPost).toHaveBeenCalledWith(post.id, undefined);
    });

    it('should throw NotFoundException if post not found', async () => {
        postRepository.getPostById.mockResolvedValue(undefined);
        await expect(useCase.execute('inv')).rejects.toThrow(NotFoundException);
    });
});
