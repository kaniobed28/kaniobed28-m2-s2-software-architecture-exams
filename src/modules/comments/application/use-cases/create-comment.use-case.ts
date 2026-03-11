import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostRepository } from '../../../posts/domain/repositories/post.repository';
import { CommentRepository } from '../../domain/repositories/comment.repository';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { CommentEntity } from '../../domain/entities/comment.entity';
import { CreateCommentDto } from '../dtos/create-comment.dto';

export class CommentCreatedEvent {
    constructor(
        public readonly commentId: string,
        public readonly postId: string,
        public readonly postAuthorId: string,
        public readonly commentAuthorId: string,
    ) { }
}

@Injectable()
export class CreateCommentUseCase {
    constructor(
        private readonly commentRepository: CommentRepository,
        private readonly postRepository: PostRepository,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    public async execute(postId: string, input: CreateCommentDto, user: UserEntity): Promise<CommentEntity> {
        const post = await this.postRepository.getPostById(postId);

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        if (post.status !== 'accepted') {
            throw new ForbiddenException('Comments can only be added to accepted posts');
        }

        const comment = CommentEntity.create(input.content, user.id, postId);
        await this.commentRepository.createComment(comment);

        this.eventEmitter.emit('comment.created', new CommentCreatedEvent(
            comment.id,
            post.id,
            post.authorId,
            user.id,
        ));

        return comment;
    }
}
