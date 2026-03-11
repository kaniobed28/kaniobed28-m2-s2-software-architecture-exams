import { NotFoundException } from '@nestjs/common';
import { GetFollowingUseCase } from './get-following.use-case';
import { FollowRepository } from '../../domain/repositories/follow.repository';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { UserEntity } from '../../../users/domain/entities/user.entity';

describe('GetFollowingUseCase', () => {
    let useCase: GetFollowingUseCase;
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
        useCase = new GetFollowingUseCase(followRepository, userRepository);
    });

    it('should return paginated following users', async () => {
        const user = UserEntity.create('user', 'user', 'pw');
        const following = UserEntity.create('following_user', 'writer', 'pw');
        userRepository.getUserById.mockResolvedValue(user);
        followRepository.getFollowing.mockResolvedValue([[following], 1]);

        const result = await useCase.execute(user.id, { page: 1, pageSize: 20 });

        expect(result.total).toBe(1);
        expect(result.users).toHaveLength(1);
        expect(result.users[0].id).toBe(following.id);
        expect(followRepository.getFollowing).toHaveBeenCalledWith(user.id, { page: 1, pageSize: 20 });
    });

    it('should throw NotFoundException if user not found', async () => {
        userRepository.getUserById.mockResolvedValue(undefined);
        await expect(useCase.execute('invalid')).rejects.toThrow(NotFoundException);
    });
});
