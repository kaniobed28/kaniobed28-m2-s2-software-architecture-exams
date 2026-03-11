import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostRepository } from '../../../posts/domain/repositories/post.repository';
import { CommentRepository } from '../../domain/repositories/comment.repository';
import { UserEntity } from '../../../users/domain/entities/user.entity';

@Injectable()
export class DeleteCommentUseCase {
    constructor(
        private readonly commentRepository: CommentRepository,
        private readonly postRepository: PostRepository,
    ) { }

    public async execute(commentId: string, user: UserEntity): Promise<void> {
        const comment = await this.commentRepository.getCommentById(commentId);

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        const post = await this.postRepository.getPostById(comment.postId);
        if (!post) {
            throw new NotFoundException('Associated post not found');
        }

        // Authorization: Comment author OR Post author OR Moderator/Admin
        const isCommentAuthor = comment.authorId === user.id;
        const isPostAuthor = post.authorId === user.id;
        const isModeratorOrAdmin = user.role === 'admin' || user.role === 'moderator';

        if (!isCommentAuthor && !isPostAuthor && !isModeratorOrAdmin) {
            throw new ForbiddenException('You do not have permission to delete this comment');
        }

        await this.commentRepository.deleteComment(commentId);
    }
}
