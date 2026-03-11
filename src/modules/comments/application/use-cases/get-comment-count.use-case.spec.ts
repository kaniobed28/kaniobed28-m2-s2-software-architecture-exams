import { NotFoundException } from '@nestjs/common';
import { GetCommentCountUseCase } from './get-comment-count.use-case';
import { CommentRepository } from '../../domain/repositories/comment.repository';
import { PostRepository } from '../../../posts/domain/repositories/post.repository';
import { PostEntity } from '../../../posts/domain/entities/post.entity';
import { CommentEntity } from '../../domain/entities/comment.entity';

describe('GetCommentCountUseCase', () => {
    let useCase: GetCommentCountUseCase;
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
            getPostById: jest.fn(),
            getPosts: jest.fn(),
            createPost: jest.fn(),
            updatePost: jest.fn(),
            deletePost: jest.fn(),
            getPostBySlug: jest.fn(),
        };
        useCase = new GetCommentCountUseCase(commentRepository, postRepository);
    });

    it('should return comment count successfully', async () => {
        const post = PostEntity.create('Test Post', 'Content', 'author-id');
        postRepository.getPostById.mockResolvedValue(post);

        commentRepository.getCommentCountForPost.mockResolvedValue(2);

        const result = await useCase.execute(post.id);

        expect(result).toEqual({ postId: post.id, count: 2 });
    });

    it('should throw NotFoundException if post not found', async () => {
        postRepository.getPostById.mockResolvedValue(undefined);

        await expect(useCase.execute('invalid')).rejects.toThrow(NotFoundException);
    });
});
