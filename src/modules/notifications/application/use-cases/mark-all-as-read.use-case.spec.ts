import { Test, TestingModule } from '@nestjs/testing';
import { MarkAllAsReadUseCase } from './mark-all-as-read.use-case';
import { NotificationRepository } from '../../domain/repositories/notification.repository';

describe('MarkAllAsReadUseCase', () => {
    let useCase: MarkAllAsReadUseCase;
    let repository: jest.Mocked<NotificationRepository>;

    beforeEach(async () => {
        repository = {
            markAllAsRead: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MarkAllAsReadUseCase,
                { provide: NotificationRepository, useValue: repository },
            ],
        }).compile();

        useCase = module.get<MarkAllAsReadUseCase>(MarkAllAsReadUseCase);
    });

    it('should return markedCount', async () => {
        repository.markAllAsRead.mockResolvedValue(7);

        const result = await useCase.execute('user1');

        expect(result.markedCount).toBe(7);
        expect(repository.markAllAsRead).toHaveBeenCalledWith('user1');
    });
});
