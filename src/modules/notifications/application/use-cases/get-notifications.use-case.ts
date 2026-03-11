import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository, GetNotificationsOptions } from '../../domain/repositories/notification.repository';
import { NotificationEntity } from '../../domain/entities/notification.entity';

export interface PaginatedNotificationsResult {
    notifications: NotificationEntity[];
    total: number;
    unreadCount: number;
    page: number;
    pageSize: number;
}

@Injectable()
export class GetNotificationsUseCase {
    constructor(private readonly notificationRepository: NotificationRepository) { }

    public async execute(userId: string, options?: GetNotificationsOptions): Promise<PaginatedNotificationsResult> {
        const page = options?.page ?? 1;
        const pageSize = options?.pageSize ?? 20;

        const [notifications, total, unreadCount] = await this.notificationRepository.getUserNotifications(userId, options);

        return {
            notifications,
            total,
            unreadCount,
            page,
            pageSize,
        };
    }
}
