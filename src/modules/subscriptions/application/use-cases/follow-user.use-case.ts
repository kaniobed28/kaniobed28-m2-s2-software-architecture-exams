import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FollowRepository } from '../../domain/repositories/follow.repository';
import { FollowEntity } from '../../domain/entities/follow.entity';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';

@Injectable()
export class FollowUserUseCase {
    constructor(
        private readonly followRepository: FollowRepository,
        private readonly userRepository: UserRepository,
    ) { }

    public async execute(follower: UserEntity, followingId: string): Promise<void> {
        if (follower.id === followingId) {
            throw new BadRequestException('Users cannot follow themselves');
        }

        const followingUser = await this.userRepository.getUserById(followingId);
        if (!followingUser) {
            throw new NotFoundException('User to follow not found');
        }

        const isFollowing = await this.followRepository.isFollowing(follower.id, followingId);
        if (isFollowing) {
            return;
        }

        const follow = FollowEntity.create(follower.id, followingId);
        await this.followRepository.addFollow(follow);
    }
}
