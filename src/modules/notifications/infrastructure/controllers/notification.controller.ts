import { Controller, Get, Patch, Post, UseGuards, Param, Query } from '@nestjs/common';
import { Requester } from '../../../shared/auth/infrastructure/decorators/requester.decorator';
import { JwtAuthGuard } from '../../../shared/auth/infrastructure/guards/jwt-auth.guard';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { GetNotificationsUseCase } from '../../application/use-cases/get-notifications.use-case';
import { MarkAsReadUseCase } from '../../application/use-cases/mark-as-read.use-case';
import { MarkAllAsReadUseCase } from '../../application/use-cases/mark-all-as-read.use-case';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(
        private readonly getNotificationsUseCase: GetNotificationsUseCase,
        private readonly markAsReadUseCase: MarkAsReadUseCase,
        private readonly markAllAsReadUseCase: MarkAllAsReadUseCase,
    ) { }

    @Get()
    public async getNotifications(
        @Requester() user: UserEntity,
        @Query('isRead') isRead?: string,
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
    ) {
        let isReadBool: boolean | undefined = undefined;
        if (isRead === 'true') isReadBool = true;
        else if (isRead === 'false') isReadBool = false;

        const p = page ? parseInt(page, 10) : 1;
        const ps = pageSize ? parseInt(pageSize, 10) : 20;

        const result = await this.getNotificationsUseCase.execute(user.id, {
            isRead: isReadBool,
            page: p,
            pageSize: ps,
        });

        return {
            notifications: result.notifications.map(n => n.toJSON()),
            total: result.total,
            unreadCount: result.unreadCount,
            page: result.page,
            pageSize: result.pageSize,
        };
    }

    @Patch(':id/read')
    public async markAsRead(@Param('id') id: string, @Requester() user: UserEntity) {
        const notif = await this.markAsReadUseCase.execute(id, user);
        return notif.toJSON();
    }

    @Post('mark-all-read')
    public async markAllAsRead(@Requester() user: UserEntity) {
        return this.markAllAsReadUseCase.execute(user.id);
    }
}
