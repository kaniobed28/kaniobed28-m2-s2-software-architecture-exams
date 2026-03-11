import { Test, TestingModule } from '@nestjs/testing';
import { NotificationEventHandler } from './notification.handler';
import { NotificationRepository } from '../../domain/repositories/notification.repository';
import { FollowRepository } from '../../../subscriptions/domain/repositories/follow.repository';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { NotificationEntity, NotificationType } from '../../domain/entities/notification.entity';
import { UserEntity } from '../../../users/domain/entities/user.entity';

describe('NotificationEventHandler', () => {
    let handler: NotificationEventHandler;
    let notificationRepository: jest.Mocked<NotificationRepository>;
    let followRepository: jest.Mocked<FollowRepository>;
    let userRepository: jest.Mocked<UserRepository>;

    beforeEach(async () => {
        notificationRepository = {
            save: jest.fn().mockResolvedValue(undefined),
            getById: jest.fn(),
            getUserNotifications: jest.fn(),
            markAllAsRead: jest.fn(),
        } as any;

        followRepository = {
            addFollow: jest.fn(),
            removeFollow: jest.fn(),
            isFollowing: jest.fn(),
            getFollowers: jest.fn(),
            getFollowing: jest.fn(),
        } as any;

        userRepository = {
            listUsers: jest.fn(),
            getUserById: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationEventHandler,
                { provide: NotificationRepository, useValue: notificationRepository },
                { provide: FollowRepository, useValue: followRepository },
                { provide: UserRepository, useValue: userRepository },
            ],
        }).compile();

        handler = module.get<NotificationEventHandler>(NotificationEventHandler);
    });

    describe('handlePostStatusUpdate', () => {
        it('should create notifications for moderators when status becomes waiting', async () => {
            const mods = [
                UserEntity.create('mod1', 'moderator', 'pw'),
                UserEntity.create('admin1', 'admin', 'pw'),
                UserEntity.create('user1', 'user', 'pw'),
            ];
            userRepository.listUsers.mockResolvedValue(mods);

            await handler.handlePostStatusUpdate({
                postId: 'p1', authorId: 'a1', oldStatus: 'draft', status: 'waiting', title: 'T'
            });

            expect(notificationRepository.save).toHaveBeenCalledTimes(2);
            const call1 = notificationRepository.save.mock.calls[0][0];
            expect(call1.recipientId).toBe(mods[0].id);
            expect(call1.type).toBe(NotificationType.POST_PENDING_REVIEW);
        });

        it('should notify author and followers when status becomes accepted', async () => {
            const followers = [UserEntity.create('f1', 'user', 'pw')];
            followRepository.getFollowers.mockResolvedValue([followers, 1]);

            await handler.handlePostStatusUpdate({
                postId: 'p1', authorId: 'a1', oldStatus: 'waiting', status: 'accepted', title: 'T'
            });

            expect(notificationRepository.save).toHaveBeenCalledTimes(2);
            const call1 = notificationRepository.save.mock.calls[0][0];
            expect(call1.recipientId).toBe('a1');
            expect(call1.type).toBe(NotificationType.POST_APPROVED);

            const call2 = notificationRepository.save.mock.calls[1][0];
            expect(call2.recipientId).toBe(followers[0].id);
            expect(call2.type).toBe(NotificationType.NEW_POST_FROM_FOLLOWED);
        });

        it('should notify author when status becomes rejected', async () => {
            await handler.handlePostStatusUpdate({
                postId: 'p1', authorId: 'a1', oldStatus: 'waiting', status: 'rejected', title: 'T'
            });

            expect(notificationRepository.save).toHaveBeenCalledTimes(1);
            expect(notificationRepository.save.mock.calls[0][0].type).toBe(NotificationType.POST_REJECTED);
        });
    });

    describe('handlePostDeleted', () => {
        it('should notify author if deleted by someone else', async () => {
            await handler.handlePostDeleted({
                postId: 'p1', authorId: 'a1', title: 'T', deletedByPath: 'mod1'
            });
            expect(notificationRepository.save).toHaveBeenCalledTimes(1);
        });

        it('should not notify author if deleted by self', async () => {
            await handler.handlePostDeleted({
                postId: 'p1', authorId: 'a1', title: 'T', deletedByPath: 'a1'
            });
            expect(notificationRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('handleCommentCreated', () => {
        it('should notify post author if someone else commented', async () => {
            await handler.handleCommentCreated({
                commentId: 'c1', postId: 'p1', postAuthorId: 'a1', commentAuthorId: 'c2'
            });
            expect(notificationRepository.save).toHaveBeenCalledTimes(1);
        });

        it('should not notify post author if they commented on their own post', async () => {
            await handler.handleCommentCreated({
                commentId: 'c1', postId: 'p1', postAuthorId: 'a1', commentAuthorId: 'a1'
            });
            expect(notificationRepository.save).not.toHaveBeenCalled();
        });
    });
});
