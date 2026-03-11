import { Injectable } from '@nestjs/common';
import { LoggingService } from '../../../shared/logging/domain/services/logging.service';
import { PostEntity } from '../../domain/entities/post.entity';
import { PostRepository } from '../../domain/repositories/post.repository';
import { UserEntity } from '../../../users/domain/entities/user.entity';

@Injectable()
export class GetPostsUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly loggingService: LoggingService,
  ) { }

  public async execute(tags?: string[], user?: UserEntity): Promise<PostEntity[]> {
    this.loggingService.log('GetPostsUseCase.execute');
    let posts = await this.postRepository.getPosts();

    if (tags && tags.length > 0) {
      posts = posts.filter(post =>
        post.tags.some(t => tags.includes(t.name))
      );
    }

    posts = posts.filter(post => {
      if (post.status === 'accepted') return true;
      if (!user) return false;
      if (user.role === 'admin' || user.role === 'moderator') return true;
      if (post.authorId === user.id) return true;
      return false;
    });

    return posts;
  }
}
