import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoggingService } from '../../../shared/logging/domain/services/logging.service';
import { PostRepository } from '../../domain/repositories/post.repository';
import { UserEntity } from '../../../users/domain/entities/user.entity';

@Injectable()
export class DeletePostUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly loggingService: LoggingService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(id: string, user?: UserEntity): Promise<void> {
    this.loggingService.log('DeletePostUseCase.execute');
    const post = await this.postRepository.getPostById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.postRepository.deletePost(id);

    this.eventEmitter.emit('post.deleted', {
      postId: id,
      authorId: post.authorId,
      title: post.title,
      deletedByPath: user ? user.id : 'system',
    });
  }
}
