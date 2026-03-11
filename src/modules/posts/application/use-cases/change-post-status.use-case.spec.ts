import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ChangePostStatusUseCase } from './change-post-status.use-case';
import { PostRepository } from '../../domain/repositories/post.repository';
import { PostEntity } from '../../domain/entities/post.entity';
import { UserEntity } from '../../../users/domain/entities/user.entity';

describe('ChangePostStatusUseCase', () => {
  let useCase: ChangePostStatusUseCase;
  let postRepository: jest.Mocked<PostRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    postRepository = {
      getPostById: jest.fn(),
      updatePost: jest.fn(),
      deletePost: jest.fn(),
      getPosts: jest.fn(),
      getPostBySlug: jest.fn(),
      savePost: jest.fn(),
    } as any;

    eventEmitter = {
      emit: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePostStatusUseCase,
        { provide: PostRepository, useValue: postRepository },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    useCase = module.get<ChangePostStatusUseCase>(ChangePostStatusUseCase);
  });

  it('should throw NotFoundException if post does not exist', async () => {
    postRepository.getPostById.mockResolvedValue(undefined);
    await expect(useCase.execute('1', 'waiting', UserEntity.create('user', 'writer', 'pw')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if writer tries to accept post', async () => {
    const post = PostEntity.create('Title', 'Content', 'u1');
    postRepository.getPostById.mockResolvedValue(post);
    await expect(useCase.execute(post.id, 'accepted', UserEntity.reconstitute({ id: 'u1', username: 'user', role: 'writer', createdAt: new Date() })))
      .rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if writer tries to submit another users post', async () => {
    const post = PostEntity.create('Title', 'Content', 'u1');
    postRepository.getPostById.mockResolvedValue(post);
    await expect(useCase.execute(post.id, 'waiting', UserEntity.reconstitute({ id: 'u2', username: 'user2', role: 'writer', createdAt: new Date() })))
      .rejects.toThrow(ForbiddenException);
  });

  it('should allow moderator to accept a post and emit event', async () => {
    const post = PostEntity.create('Title', 'Content', 'u1');
    post.changeStatus('waiting');
    postRepository.getPostById.mockResolvedValue(post);
    const mod = UserEntity.reconstitute({ id: 'mod', username: 'm', role: 'moderator', createdAt: new Date() });

    await useCase.execute(post.id, 'accepted', mod);

    expect(post.status).toBe('accepted');
    expect(postRepository.updatePost).toHaveBeenCalledWith(post.id, post);
    expect(eventEmitter.emit).toHaveBeenCalledWith('post.updated', {
      postId: post.id,
      authorId: post.authorId,
      oldStatus: 'waiting',
      status: 'accepted',
      title: post.title,
    });
  });
});
