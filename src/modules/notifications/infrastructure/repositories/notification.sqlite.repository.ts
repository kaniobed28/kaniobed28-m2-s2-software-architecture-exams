import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { NotificationRepository, GetNotificationsOptions } from '../../domain/repositories/notification.repository';
import { SQLiteNotificationEntity } from '../entities/notification.sqlite.entity';

@Injectable()
export class SQLiteNotificationRepository implements NotificationRepository {
    constructor(private readonly dataSource: DataSource) { }

    public async save(notification: NotificationEntity): Promise<void> {
        const entity = this.dataSource.getRepository(SQLiteNotificationEntity).create({
            id: notification.id,
            recipientId: notification.recipientId,
            type: notification.type,
            message: notification.message,
            metadata: notification.metadata,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
        });
        await this.dataSource.getRepository(SQLiteNotificationEntity).save(entity);
    }

    public async getById(id: string): Promise<NotificationEntity | null> {
        const entity = await this.dataSource.getRepository(SQLiteNotificationEntity).findOne({ where: { id } });
        if (!entity) return null;
        return NotificationEntity.reconstitute({
            id: entity.id,
            recipientId: entity.recipientId,
            type: entity.type,
            message: entity.message,
            metadata: entity.metadata,
            isRead: entity.isRead,
            createdAt: entity.createdAt,
        });
    }

    public async getUserNotifications(userId: string, options?: GetNotificationsOptions): Promise<[NotificationEntity[], number, number]> {
        const page = options?.page || 1;
        const pageSize = options?.pageSize || 20;

        const where: any = { recipientId: userId };
        if (options?.isRead !== undefined) {
            where.isRead = options.isRead;
        }

        const [list, total] = await this.dataSource.getRepository(SQLiteNotificationEntity).findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        const unreadCount = await this.dataSource.getRepository(SQLiteNotificationEntity).count({
            where: { recipientId: userId, isRead: false },
        });

        const entities = list.map(entity => NotificationEntity.reconstitute({
            id: entity.id,
            recipientId: entity.recipientId,
            type: entity.type,
            message: entity.message,
            metadata: entity.metadata,
            isRead: entity.isRead,
            createdAt: entity.createdAt,
        }));

        return [entities, total, unreadCount];
    }

    public async markAllAsRead(userId: string): Promise<number> {
        const result = await this.dataSource.getRepository(SQLiteNotificationEntity).update(
            { recipientId: userId, isRead: false },
            { isRead: true },
        );
        return result.affected || 0;
    }
}
