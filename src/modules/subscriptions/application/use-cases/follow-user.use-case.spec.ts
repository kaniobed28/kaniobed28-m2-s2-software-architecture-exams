import { Test, TestingModule } from '@nestjs/testing';
import { FollowUserUseCase } from './follow-user.use-case';
import { FollowRepository } from '../../domain/repositories/follow.repository';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('FollowUserUseCase', () => {
    let useCase: FollowUserUseCase;
    let followRepository: jest.Mocked<FollowRepository>;
    let userRepository: jest.Mocked<UserRepository>;

    beforeEach(async () => {
        followRepository = {
            addFollow: jest.fn(),
            removeFollow: jest.fn(),
            isFollowing: jest.fn(),
            getFollowers: jest.fn(),
            getFollowing: jest.fn(),
        } as any;

        userRepository = {
            listUsers: jest.fn(),
            getUserById: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FollowUserUseCase,
                {
                    provide: FollowRepository,
                    useValue: followRepository,
                },
                {
                    provide: UserRepository,
                    useValue: userRepository,
                },
            ],
        }).compile();

        useCase = module.get<FollowUserUseCase>(FollowUserUseCase);
    });

    it('should allow a user to follow another user', async () => {
        const follower = UserEntity.create('follower1', 'user', 'P@ssword123');
        const following = UserEntity.create('following1', 'writer', 'P@ssword123');

        userRepository.getUserById.mockResolvedValue(following);
        followRepository.isFollowing.mockResolvedValue(false);

        await useCase.execute(follower, following.id);

        expect(followRepository.addFollow).toHaveBeenCalledTimes(1);
        const followArg = followRepository.addFollow.mock.calls[0][0];
        expect(followArg.followerId).toBe(follower.id);
        expect(followArg.followingId).toBe(following.id);
    });

    it('should throw BadRequestException if a user tries to follow themselves', async () => {
        const follower = UserEntity.create('user1', 'user', 'P@ssword123');

        await expect(useCase.execute(follower, follower.id)).rejects.toThrow(BadRequestException);
        expect(followRepository.addFollow).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if the user to follow does not exist', async () => {
        const follower = UserEntity.create('user1', 'user', 'P@ssword123');
        userRepository.getUserById.mockResolvedValue(undefined);

        await expect(useCase.execute(follower, 'non-existent-user')).rejects.toThrow(NotFoundException);
        expect(followRepository.addFollow).not.toHaveBeenCalled();
    });

    it('should silently return if the user is already following the target user', async () => {
        const follower = UserEntity.create('user1', 'user', 'P@ssword123');
        const following = UserEntity.create('user2', 'writer', 'P@ssword123');

        userRepository.getUserById.mockResolvedValue(following);
        followRepository.isFollowing.mockResolvedValue(true);

        await expect(useCase.execute(follower, following.id)).resolves.toBeUndefined();
        expect(followRepository.addFollow).not.toHaveBeenCalled();
    });
});
