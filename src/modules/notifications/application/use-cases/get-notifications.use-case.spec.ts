import { Test, TestingModule } from '@nestjs/testing';
import { GetNotificationsUseCase } from './get-notifications.use-case';
import { NotificationRepository } from '../../domain/repositories/notification.repository';
import { NotificationEntity, NotificationType } from '../../domain/entities/notification.entity';

describe('GetNotificationsUseCase', () => {
    let useCase: GetNotificationsUseCase;
    let repository: jest.Mocked<NotificationRepository>;

    beforeEach(async () => {
        repository = {
            getUserNotifications: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetNotificationsUseCase,
                { provide: NotificationRepository, useValue: repository },
            ],
        }).compile();

        useCase = module.get<GetNotificationsUseCase>(GetNotificationsUseCase);
    });

    it('should return paginated notifications', async () => {
        const notifs = [NotificationEntity.create('id1', 'user1', NotificationType.NEW_COMMENT, 'msg')];
        repository.getUserNotifications.mockResolvedValue([notifs, 10, 5]);

        const result = await useCase.execute('user1', { page: 2, pageSize: 5 });

        expect(result.notifications).toEqual(notifs);
        expect(result.total).toBe(10);
        expect(result.unreadCount).toBe(5);
        expect(result.page).toBe(2);
        expect(result.pageSize).toBe(5);
        expect(repository.getUserNotifications).toHaveBeenCalledWith('user1', { page: 2, pageSize: 5 });
    });
});
