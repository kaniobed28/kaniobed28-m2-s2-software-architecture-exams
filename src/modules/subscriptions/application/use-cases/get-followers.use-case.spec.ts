import { NotFoundException } from '@nestjs/common';
import { GetFollowersUseCase } from './get-followers.use-case';
import { FollowRepository } from '../../domain/repositories/follow.repository';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { UserEntity } from '../../../users/domain/entities/user.entity';

describe('GetFollowersUseCase', () => {
    let useCase: GetFollowersUseCase;
    let followRepository: jest.Mocked<FollowRepository>;
    let userRepository: jest.Mocked<UserRepository>;

    beforeEach(() => {
        followRepository = {
            addFollow: jest.fn(),
            removeFollow: jest.fn(),
            isFollowing: jest.fn(),
            getFollowers: jest.fn(),
            getFollowing: jest.fn(),
        };
        userRepository = {
            listUsers: jest.fn(),
            getUserById: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
        };
        useCase = new GetFollowersUseCase(followRepository, userRepository);
    });

    it('should return paginated followers', async () => {
        const user = UserEntity.create('user', 'user', 'pw');
        const follower = UserEntity.create('follower', 'writer', 'pw');
        userRepository.getUserById.mockResolvedValue(user);
        followRepository.getFollowers.mockResolvedValue([[follower], 1]);

        const result = await useCase.execute(user.id, { page: 1, pageSize: 20 });

        expect(result.total).toBe(1);
        expect(result.users).toHaveLength(1);
        expect(result.users[0].id).toBe(follower.id);
        expect(followRepository.getFollowers).toHaveBeenCalledWith(user.id, { page: 1, pageSize: 20 });
    });

    it('should throw NotFoundException if user not found', async () => {
        userRepository.getUserById.mockResolvedValue(undefined);
        await expect(useCase.execute('invalid')).rejects.toThrow(NotFoundException);
    });
});
