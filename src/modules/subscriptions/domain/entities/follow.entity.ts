export class FollowEntity {
    private constructor(
        public readonly followerId: string,
        public readonly followingId: string,
        public readonly createdAt: Date,
    ) { }

    public static create(followerId: string, followingId: string): FollowEntity {
        return new FollowEntity(followerId, followingId, new Date());
    }

    public static reconstitute(input: Record<string, unknown>): FollowEntity {
        return new FollowEntity(
            input.followerId as string,
            input.followingId as string,
            new Date(input.createdAt as string | Date),
        );
    }

    public toJSON(): Record<string, unknown> {
        return {
            followerId: this.followerId,
            followingId: this.followingId,
            createdAt: this.createdAt.toISOString(),
        };
    }
}
