import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateCommentUseCase } from './update-comment.use-case';
import { CommentRepository } from '../../domain/repositories/comment.repository';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { CommentEntity } from '../../domain/entities/comment.entity';

describe('UpdateCommentUseCase', () => {
    let useCase: UpdateCommentUseCase;
    let commentRepository: jest.Mocked<CommentRepository>;

    beforeEach(() => {
        commentRepository = {
            getCommentsForPost: jest.fn(),
            getCommentCountForPost: jest.fn(),
            getCommentById: jest.fn(),
            createComment: jest.fn(),
            updateComment: jest.fn(),
            deleteComment: jest.fn(),
        };
        useCase = new UpdateCommentUseCase(commentRepository);
    });

    it('should update a comment successfully', async () => {
        const user = UserEntity.create('user', 'user', 'pw');
        const comment = CommentEntity.create('Original', user.id, 'post-id');
        commentRepository.getCommentById.mockResolvedValue(comment);

        const updated = await useCase.execute(comment.id, { content: 'Updated' }, user);

        expect(updated.content).toBe('Updated');
        expect(commentRepository.updateComment).toHaveBeenCalledWith(comment.id, comment);
    });

    it('should throw NotFoundException if comment not found', async () => {
        const user = UserEntity.create('user', 'user', 'pw');
        commentRepository.getCommentById.mockResolvedValue(undefined);

        await expect(useCase.execute('invalid', { content: 'Updated' }, user)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not author', async () => {
        const user = UserEntity.create('user', 'user', 'pw');
        const otherUser = UserEntity.create('other', 'user', 'pw');
        const comment = CommentEntity.create('Original', otherUser.id, 'post-id');
        commentRepository.getCommentById.mockResolvedValue(comment);

        await expect(useCase.execute(comment.id, { content: 'Updated' }, user)).rejects.toThrow(ForbiddenException);
    });
});
