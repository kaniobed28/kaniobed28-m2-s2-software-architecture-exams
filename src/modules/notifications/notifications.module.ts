import { Module } from '@nestjs/common';
import { AuthModule } from '../shared/auth/auth.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { GetNotificationsUseCase } from './application/use-cases/get-notifications.use-case';
import { MarkAsReadUseCase } from './application/use-cases/mark-as-read.use-case';
import { MarkAllAsReadUseCase } from './application/use-cases/mark-all-as-read.use-case';
import { NotificationEventHandler } from './application/handlers/notification.handler';
import { NotificationRepository } from './domain/repositories/notification.repository';
import { NotificationController } from './infrastructure/controllers/notification.controller';
import { SQLiteNotificationRepository } from './infrastructure/repositories/notification.sqlite.repository';

@Module({
    imports: [AuthModule, SubscriptionsModule],
    controllers: [NotificationController],
    providers: [
        {
            provide: NotificationRepository,
            useClass: SQLiteNotificationRepository,
        },
        GetNotificationsUseCase,
        MarkAsReadUseCase,
        MarkAllAsReadUseCase,
        NotificationEventHandler,
    ],
})
export class NotificationsModule { }
