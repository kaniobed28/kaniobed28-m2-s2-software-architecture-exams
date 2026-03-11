import { FollowEntity } from '../entities/follow.entity';
import { UserEntity } from '../../../users/domain/entities/user.entity';

export interface GetFollowOptions {
    page?: number;
    pageSize?: number;
}

export abstract class FollowRepository {
    public abstract addFollow(follow: FollowEntity): Promise<void>;
    public abstract removeFollow(followerId: string, followingId: string): Promise<void>;
    public abstract isFollowing(followerId: string, followingId: string): Promise<boolean>;
    public abstract getFollowers(userId: string, options?: GetFollowOptions): Promise<[UserEntity[], number]>;
    public abstract getFollowing(userId: string, options?: GetFollowOptions): Promise<[UserEntity[], number]>;
}
