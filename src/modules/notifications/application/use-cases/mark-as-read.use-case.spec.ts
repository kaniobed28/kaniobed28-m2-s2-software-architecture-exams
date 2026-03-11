import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { MarkAsReadUseCase } from './mark-as-read.use-case';
import { NotificationRepository } from '../../domain/repositories/notification.repository';
import { NotificationEntity, NotificationType } from '../../domain/entities/notification.entity';
import { UserEntity } from '../../../users/domain/entities/user.entity';

describe('MarkAsReadUseCase', () => {
    let useCase: MarkAsReadUseCase;
    let repository: jest.Mocked<NotificationRepository>;

    beforeEach(async () => {
        repository = {
            getById: jest.fn(),
            save: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MarkAsReadUseCase,
                { provide: NotificationRepository, useValue: repository },
            ],
        }).compile();

        useCase = module.get<MarkAsReadUseCase>(MarkAsReadUseCase);
    });

    it('should throw NotFoundException if not found', async () => {
        repository.getById.mockResolvedValue(null);
        await expect(useCase.execute('id', UserEntity.create('user', 'user', 'pw')))
            .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not recipient', async () => {
        const notif = NotificationEntity.create('id', 'user1', NotificationType.NEW_COMMENT, 'msg');
        repository.getById.mockResolvedValue(notif);
        const user = UserEntity.reconstitute({ id: 'user2', username: 'u2', role: 'user', createdAt: new Date() });

        await expect(useCase.execute('id', user)).rejects.toThrow(ForbiddenException);
    });

    it('should mark notification as read and return it', async () => {
        const notif = NotificationEntity.create('id', 'user1', NotificationType.NEW_COMMENT, 'msg');
        repository.getById.mockResolvedValue(notif);
        const user = UserEntity.reconstitute({ id: 'user1', username: 'u1', role: 'user', createdAt: new Date() });

        const result = await useCase.execute('id', user);

        expect(result.isRead).toBe(true);
        expect(repository.save).toHaveBeenCalledWith(notif);
    });
});
