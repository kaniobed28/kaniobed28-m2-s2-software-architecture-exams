import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotificationRepository } from '../../domain/repositories/notification.repository';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { UserEntity } from '../../../users/domain/entities/user.entity';

@Injectable()
export class MarkAsReadUseCase {
    constructor(private readonly notificationRepository: NotificationRepository) { }

    public async execute(notificationId: string, user: UserEntity): Promise<NotificationEntity> {
        const notification = await this.notificationRepository.getById(notificationId);

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        if (notification.recipientId !== user.id) {
            throw new ForbiddenException('You can only mark your own notifications as read');
        }

        notification.markAsRead();
        await this.notificationRepository.save(notification);

        return notification;
    }
}
