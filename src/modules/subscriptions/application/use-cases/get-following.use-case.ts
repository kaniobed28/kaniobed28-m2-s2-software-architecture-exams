import { Injectable, NotFoundException } from '@nestjs/common';
import { FollowRepository } from '../../domain/repositories/follow.repository';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { GetFollowOptions } from '../../domain/repositories/follow.repository';

export interface PaginatedUsersResult {
    users: UserEntity[];
    total: number;
    page: number;
    pageSize: number;
}

@Injectable()
export class GetFollowingUseCase {
    constructor(
        private readonly followRepository: FollowRepository,
        private readonly userRepository: UserRepository,
    ) { }

    public async execute(userId: string, options?: GetFollowOptions): Promise<PaginatedUsersResult> {
        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const page = options?.page ?? 1;
        const pageSize = options?.pageSize ?? 20;

        const [users, total] = await this.followRepository.getFollowing(userId, options);

        return {
            users,
            total,
            page,
            pageSize,
        };
    }
}
