import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { PostEntity } from '../../domain/entities/post.entity';
import { PostCreatedEvent } from '../../domain/events/post-created.event';
import { UserCannotCreatePostException } from '../../domain/exceptions/user-cannot-create-post.exception';
import { PostRepository } from '../../domain/repositories/post.repository';
import { CreatePostDto } from '../dtos/create-post.dto';

@Injectable()
export class CreatePostUseCase {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly postRepository: PostRepository,
  ) { }

  public async execute(input: CreatePostDto, user: UserEntity): Promise<void> {
    if (!user.permissions.posts.canCreate()) {
      throw new UserCannotCreatePostException();
    }

    let post = PostEntity.create(input.title, input.content, input.authorId, input.slug);

    let isUnique = false;
    let attempt = 0;
    let currentSlug = post.slug;
    while (!isUnique) {
      const existing = await this.postRepository.getPostBySlug(currentSlug);
      if (!existing) {
        isUnique = true;
      } else {
        attempt++;
        currentSlug = `${post.slug}-${attempt}`;
      }
    }

    post.updateSlug(currentSlug);

    await this.postRepository.createPost(post);

    this.eventEmitter.emit(PostCreatedEvent, {
      postId: post.id,
      authorId: input.authorId,
      title: post.title,
    });
  }
}
