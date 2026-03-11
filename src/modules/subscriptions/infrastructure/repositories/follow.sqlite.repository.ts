import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { FollowEntity } from '../../domain/entities/follow.entity';
import { FollowRepository, GetFollowOptions } from '../../domain/repositories/follow.repository';
import { SQLiteFollowEntity } from '../entities/follow.sqlite.entity';
import { SQLiteUserEntity } from '../../../users/infrastructure/entities/user.sqlite.entity';
import { UserEntity } from '../../../users/domain/entities/user.entity';

@Injectable()
export class SQLiteFollowRepository implements FollowRepository {
    constructor(private readonly dataSource: DataSource) { }

    public async addFollow(follow: FollowEntity): Promise<void> {
        console.log('ADDING FOLLOW', follow);
        await this.dataSource.getRepository(SQLiteFollowEntity).save({
            followerId: follow.followerId,
            followingId: follow.followingId,
            createdAt: follow.createdAt,
        });
    }

    public async removeFollow(followerId: string, followingId: string): Promise<void> {
        await this.dataSource.getRepository(SQLiteFollowEntity).delete({
            followerId,
            followingId,
        });
    }

    public async isFollowing(followerId: string, followingId: string): Promise<boolean> {
        const count = await this.dataSource.getRepository(SQLiteFollowEntity).count({
            where: { followerId, followingId },
        });
        return count > 0;
    }

    public async getFollowers(userId: string, options?: GetFollowOptions): Promise<[UserEntity[], number]> {
        const page = options?.page || 1;
        const pageSize = options?.pageSize || 20;

        const [follows, total] = await this.dataSource.getRepository(SQLiteFollowEntity).findAndCount({
            where: { followingId: userId },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        const followerIds = follows.map(f => f.followerId);
        if (followerIds.length === 0) return [[], 0];

        const users = await this.dataSource.getRepository(SQLiteUserEntity).find({
            where: { id: In(followerIds) }
        });

        const orderedUsers = followerIds.map(id => users.find(u => u.id === id)).filter(Boolean) as SQLiteUserEntity[];

        return [orderedUsers.map(user => UserEntity.reconstitute({
            id: user.id,
            username: user.username,
            role: user.role,
            password: user.password,
        })), total];
    }

    public async getFollowing(userId: string, options?: GetFollowOptions): Promise<[UserEntity[], number]> {
        const page = options?.page || 1;
        const pageSize = options?.pageSize || 20;

        const [follows, total] = await this.dataSource.getRepository(SQLiteFollowEntity).findAndCount({
            where: { followerId: userId },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        const followingIds = follows.map(f => f.followingId);
        if (followingIds.length === 0) return [[], 0];

        const users = await this.dataSource.getRepository(SQLiteUserEntity).find({
            where: { id: In(followingIds) }
        });

        const orderedUsers = followingIds.map(id => users.find(u => u.id === id)).filter(Boolean) as SQLiteUserEntity[];

        return [orderedUsers.map(user => UserEntity.reconstitute({
            id: user.id,
            username: user.username,
            role: user.role,
            password: user.password,
        })), total];
    }
}
