import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommentRepository } from '../../domain/repositories/comment.repository';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { UpdateCommentDto } from '../dtos/update-comment.dto';
import { CommentEntity } from '../../domain/entities/comment.entity';

@Injectable()
export class UpdateCommentUseCase {
    constructor(
        private readonly commentRepository: CommentRepository,
    ) { }

    public async execute(commentId: string, input: UpdateCommentDto, user: UserEntity): Promise<CommentEntity> {
        const comment = await this.commentRepository.getCommentById(commentId);

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        if (comment.authorId !== user.id) {
            throw new ForbiddenException('Only the comment author can update it');
        }

        comment.update(input.content);
        await this.commentRepository.updateComment(commentId, comment);

        return comment;
    }
}
