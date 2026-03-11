import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateCommentUseCase, CommentCreatedEvent } from './create-comment.use-case';
import { CommentRepository } from '../../domain/repositories/comment.repository';
import { PostRepository } from '../../../posts/domain/repositories/post.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { PostEntity } from '../../../posts/domain/entities/post.entity';

describe('CreateCommentUseCase', () => {
    let useCase: CreateCommentUseCase;
    let commentRepository: jest.Mocked<CommentRepository>;
    let postRepository: jest.Mocked<PostRepository>;
    let eventEmitter: jest.Mocked<EventEmitter2>;

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
        eventEmitter = {
            emit: jest.fn(),
        } as unknown as jest.Mocked<EventEmitter2>;

        useCase = new CreateCommentUseCase(commentRepository, postRepository, eventEmitter);
    });

    it('should create comment and emit event if post is accepted', async () => {
        const user = UserEntity.create('author1', 'writer', 'pw');
        const post = PostEntity.create('Title', 'Content', user.id);
        (post as any)._status = 'accepted';

        postRepository.getPostById.mockResolvedValue(post);
        commentRepository.createComment.mockResolvedValue();

        const result = await useCase.execute(post.id, { content: 'Nice post!' }, user);

        expect(result.content).toBe('Nice post!');
        expect(commentRepository.createComment).toHaveBeenCalledWith(result);
        expect(eventEmitter.emit).toHaveBeenCalledWith(
            'comment.created',
            expect.any(CommentCreatedEvent)
        );
    });

    it('should throw ForbiddenException if post is not accepted', async () => {
        const user = UserEntity.create('author1', 'writer', 'pw');
        const post = PostEntity.create('Title', 'Content', user.id);
        // Default status is draft

        postRepository.getPostById.mockResolvedValue(post);

        await expect(useCase.execute(post.id, { content: 'Nice' }, user)).rejects.toThrow(ForbiddenException);
        expect(commentRepository.createComment).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if post missing', async () => {
        const user = UserEntity.create('author1', 'writer', 'pw');
        postRepository.getPostById.mockResolvedValue(undefined);

        await expect(useCase.execute('invalid', { content: 'Nice' }, user)).rejects.toThrow(NotFoundException);
    });
});
