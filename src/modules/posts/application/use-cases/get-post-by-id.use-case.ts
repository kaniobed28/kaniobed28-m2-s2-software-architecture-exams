import { Injectable } from '@nestjs/common';
import { LoggingService } from '../../../shared/logging/domain/services/logging.service';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { PostEntity } from '../../domain/entities/post.entity';
import { PostRepository } from '../../domain/repositories/post.repository';

@Injectable()
export class GetPostByIdUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly loggingService: LoggingService,
  ) {}

  public async execute(
    id: string,
    user: UserEntity,
  ): Promise<PostEntity | undefined> {
    this.loggingService.log('GetPostByIdUseCase.execute');
    const post = await this.postRepository.getPostById(id);
    if (!post) return;

    if (!user.permissions.posts.canReadPost(post)) {
      throw new Error('Cannot read this post');
    }

    return post;
  }
}
