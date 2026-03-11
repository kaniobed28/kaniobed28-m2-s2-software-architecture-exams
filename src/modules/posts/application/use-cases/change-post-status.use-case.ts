import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostRepository } from '../../domain/repositories/post.repository';
import { PostStatus } from '../../domain/entities/post.entity';
import { UserEntity } from '../../../users/domain/entities/user.entity';

@Injectable()
export class ChangePostStatusUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(id: string, status: PostStatus, user: UserEntity): Promise<void> {
    const post = await this.postRepository.getPostById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Role check:
    // If user is 'writer', they can only change 'draft' -> 'waiting'
    // If user is 'moderator' or 'admin', they can change 'waiting' -> 'accepted' / 'rejected'
    if (user.role === 'writer' || user.role === 'user') {
        if (status !== 'waiting' && status !== 'draft') {
            throw new ForbiddenException('Authors can only change status to draft or waiting');
        }
        if (post.authorId !== user.id) {
            throw new ForbiddenException('You can only submit your own posts');
        }
    } else if (user.role === 'moderator' || user.role === 'admin') {
        if (status !== 'accepted' && status !== 'rejected' && status !== 'waiting') {
            throw new ForbiddenException('Moderators can only accept, reject, or wait posts');
        }
    } else {
        throw new ForbiddenException('Role not allowed to change status');
    }

    const oldStatus = post.status;
    post.changeStatus(status);
    await this.postRepository.updatePost(id, post);

    this.eventEmitter.emit('post.updated', {
      postId: post.id,
      authorId: post.authorId,
      oldStatus,
      status: post.status,
      title: post.title,
    });
  }
}
