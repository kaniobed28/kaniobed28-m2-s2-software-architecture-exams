import { Injectable, NotFoundException } from '@nestjs/common';
import { FollowRepository } from '../../domain/repositories/follow.repository';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';

@Injectable()
export class UnfollowUserUseCase {
    constructor(
        private readonly followRepository: FollowRepository,
        private readonly userRepository: UserRepository,
    ) { }

    public async execute(follower: UserEntity, followingId: string): Promise<void> {
        const followingUser = await this.userRepository.getUserById(followingId);
        if (!followingUser) {
            throw new NotFoundException('User to unfollow not found');
        }

        const isFollowing = await this.followRepository.isFollowing(follower.id, followingId);
        if (!isFollowing) {
            throw new NotFoundException('You are not following this user');
        }

        await this.followRepository.removeFollow(follower.id, followingId);
    }
}
