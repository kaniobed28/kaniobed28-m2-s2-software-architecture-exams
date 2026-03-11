import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteCommentUseCase } from './delete-comment.use-case';
import { CommentRepository } from '../../domain/repositories/comment.repository';
import { PostRepository } from '../../../posts/domain/repositories/post.repository';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { PostEntity } from '../../../posts/domain/entities/post.entity';
import { CommentEntity } from '../../domain/entities/comment.entity';

describe('DeleteCommentUseCase', () => {
    let useCase: DeleteCommentUseCase;
    let commentRepository: jest.Mocked<CommentRepository>;
    let postRepository: jest.Mocked<PostRepository>;

    beforeEach(() => {
        commentRepository = {
            getCommentsForPost: jest.fn(),
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
        useCase = new DeleteCommentUseCase(commentRepository, postRepository);
    });

    it('should allow comment author to delete comment', async () => {
        const defaultAuthor = UserEntity.create('author', 'writer', 'pw');
        const post = PostEntity.create('Valid Title', 'Valid Content', defaultAuthor.id);
        const commentAuthor = UserEntity.create('c_auth', 'writer', 'pw');
        const comment = CommentEntity.create('Content', commentAuthor.id, post.id);

        commentRepository.getCommentById.mockResolvedValue(comment);
        postRepository.getPostById.mockResolvedValue(post);
        commentRepository.deleteComment.mockResolvedValue();

        await useCase.execute(comment.id, commentAuthor);

        expect(commentRepository.deleteComment).toHaveBeenCalledWith(comment.id);
    });

    it('should allow post author to delete any comment on their post', async () => {
        const postAuthor = UserEntity.create('p_auth', 'writer', 'pw');
        const post = PostEntity.create('Valid Title', 'Valid Content', postAuthor.id);
        const commentAuthor = UserEntity.create('c_auth', 'writer', 'pw');
        const comment = CommentEntity.create('Content', commentAuthor.id, post.id);

        commentRepository.getCommentById.mockResolvedValue(comment);
        postRepository.getPostById.mockResolvedValue(post);

        await useCase.execute(comment.id, postAuthor);
        expect(commentRepository.deleteComment).toHaveBeenCalled();
    });

    it('should allow Admin to delete any comment', async () => {
        const postAuthor = UserEntity.create('p_auth', 'writer', 'pw');
        const post = PostEntity.create('Valid Title', 'Valid Content', postAuthor.id);
        const commentAuthor = UserEntity.create('c_auth', 'writer', 'pw');
        const comment = CommentEntity.create('Content', commentAuthor.id, post.id);
        const admin = UserEntity.create('admin', 'admin', 'pw');

        commentRepository.getCommentById.mockResolvedValue(comment);
        postRepository.getPostById.mockResolvedValue(post);

        await useCase.execute(comment.id, admin);
        expect(commentRepository.deleteComment).toHaveBeenCalled();
    });

    it('should throw ForbiddenException for random user', async () => {
        const postAuthor = UserEntity.create('p_auth', 'writer', 'pw');
        const post = PostEntity.create('Valid Title', 'Valid Content', postAuthor.id);
        const commentAuthor = UserEntity.create('c_auth', 'writer', 'pw');
        const comment = CommentEntity.create('Content', commentAuthor.id, post.id);
        const random = UserEntity.create('random', 'writer', 'pw');

        commentRepository.getCommentById.mockResolvedValue(comment);
        postRepository.getPostById.mockResolvedValue(post);

        await expect(useCase.execute(comment.id, random)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if comment missing', async () => {
        const user = UserEntity.create('u', 'writer', 'pw');
        commentRepository.getCommentById.mockResolvedValue(undefined);
        await expect(useCase.execute('invalid', user)).rejects.toThrow(NotFoundException);
    });
});
