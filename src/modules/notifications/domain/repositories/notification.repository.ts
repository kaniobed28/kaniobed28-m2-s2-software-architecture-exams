import { NotificationEntity } from '../entities/notification.entity';

export interface GetNotificationsOptions {
    isRead?: boolean;
    page?: number;
    pageSize?: number;
}

export abstract class NotificationRepository {
    public abstract save(notification: NotificationEntity): Promise<void>;
    public abstract getById(id: string): Promise<NotificationEntity | null>;
    public abstract getUserNotifications(userId: string, options?: GetNotificationsOptions): Promise<[NotificationEntity[], number, number]>;
    public abstract markAllAsRead(userId: string): Promise<number>;
}
