export enum NotificationType {
    POST_PENDING_REVIEW = 'POST_PENDING_REVIEW',
    POST_APPROVED = 'POST_APPROVED',
    POST_REJECTED = 'POST_REJECTED',
    POST_DELETED = 'POST_DELETED',
    NEW_COMMENT = 'NEW_COMMENT',
    NEW_POST_FROM_FOLLOWED = 'NEW_POST_FROM_FOLLOWED',
}

export class NotificationEntity {
    private constructor(
        public readonly id: string,
        public readonly recipientId: string,
        public readonly type: NotificationType,
        public readonly message: string,
        public readonly metadata: Record<string, unknown>,
        public isRead: boolean,
        public readonly createdAt: Date,
    ) { }

    public static create(
        id: string,
        recipientId: string,
        type: NotificationType,
        message: string,
        metadata: Record<string, unknown> = {},
    ): NotificationEntity {
        return new NotificationEntity(id, recipientId, type, message, metadata, false, new Date());
    }

    public static reconstitute(input: Record<string, unknown>): NotificationEntity {
        return new NotificationEntity(
            input.id as string,
            input.recipientId as string,
            input.type as NotificationType,
            input.message as string,
            input.metadata as Record<string, unknown>,
            input.isRead as boolean,
            new Date(input.createdAt as string | Date),
        );
    }

    public markAsRead(): void {
        this.isRead = true;
    }

    public toJSON(): Record<string, unknown> {
        return {
            id: this.id,
            recipientId: this.recipientId,
            type: this.type,
            message: this.message,
            metadata: this.metadata,
            isRead: this.isRead,
            createdAt: this.createdAt.toISOString(),
        };
    }
}
