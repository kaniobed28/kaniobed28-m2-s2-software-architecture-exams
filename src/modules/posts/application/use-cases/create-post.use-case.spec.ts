import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  makeUserWithoutPermission,
  makeUserWithPermission,
} from '../../../../test/helpers/user.helpers';
import { PostCreatedEvent } from '../../domain/events/post-created.event';
import { UserCannotCreatePostException } from '../../domain/exceptions/user-cannot-create-post.exception';
import { PostRepository } from '../../domain/repositories/post.repository';
import { CreatePostUseCase } from './create-post.use-case';

describe('CreatePostUseCase', () => {
  let useCase: CreatePostUseCase;
  let postRepository: jest.Mocked<PostRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(() => {
    postRepository = {
      createPost: jest.fn().mockResolvedValue(undefined),
      getPostBySlug: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<PostRepository>;
    eventEmitter = {
      emit: jest.fn(),
    } as unknown as jest.Mocked<EventEmitter2>;
    useCase = new CreatePostUseCase(eventEmitter, postRepository);
  });

  it('should create a post and emit an event when user has permission', async () => {
    // Arrange
    const user = makeUserWithPermission();
    const createPostDto = {
      title: 'My first post',
      content: 'Hello world',
      authorId: user.id,
    };

    // Act
    await useCase.execute(createPostDto, user);

    // Assert
    expect(postRepository.createPost).toHaveBeenCalledTimes(1);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      PostCreatedEvent,
      expect.objectContaining({ authorId: createPostDto.authorId }),
    );
  });

  it('should create a post with a custom slug', async () => {
    // Arrange
    const user = makeUserWithPermission();
    const createPostDto = {
      title: 'Post With Slug',
      content: 'Content',
      authorId: user.id,
      slug: 'my-custom-slug'
    };

    // Act
    await useCase.execute(createPostDto, user);

    // Assert
    expect(postRepository.createPost).toHaveBeenCalledTimes(1);
    const createdPost = (postRepository.createPost as jest.Mock).mock.calls[0][0];
    expect(createdPost.slug).toBe('my-custom-slug');
  });

  it('should throw UserCannotCreatePostException when user does not have permission', async () => {
    // Arrange
    const user = makeUserWithoutPermission();
    const createPostDto = {
      title: 'My first post',
      content: 'Hello world',
      authorId: user.id,
    };

    // Act
    const act = () => useCase.execute(createPostDto, user);

    // Assert
    await expect(act).rejects.toThrow(UserCannotCreatePostException);
    expect(postRepository.createPost).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });
});
