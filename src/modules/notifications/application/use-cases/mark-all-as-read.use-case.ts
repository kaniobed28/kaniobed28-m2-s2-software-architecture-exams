import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../../domain/repositories/notification.repository';

@Injectable()
export class MarkAllAsReadUseCase {
    constructor(private readonly notificationRepository: NotificationRepository) { }

    public async execute(userId: string): Promise<{ markedCount: number }> {
        const markedCount = await this.notificationRepository.markAllAsRead(userId);
        return { markedCount };
    }
}
