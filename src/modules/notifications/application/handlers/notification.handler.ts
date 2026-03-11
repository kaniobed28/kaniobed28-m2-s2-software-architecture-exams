import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { NotificationRepository } from '../../domain/repositories/notification.repository';
import { NotificationEntity, NotificationType } from '../../domain/entities/notification.entity';
import { FollowRepository } from '../../../subscriptions/domain/repositories/follow.repository';
import { UserRepository } from '../../../users/domain/repositories/user.repository';

@Injectable()
export class NotificationEventHandler {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly followRepository: FollowRepository,
        private readonly userRepository: UserRepository,
    ) { }

    @OnEvent('post.created')
    public async handlePostCreatedEvent(event: { postId: string, authorId: string, title: string }) {
        // Just created as draft, no notifications.
    }

    @OnEvent('post.updated')
    public async handlePostStatusUpdate(event: { postId: string, authorId: string, oldStatus: string, status: string, title: string }) {
        if (event.oldStatus === event.status) return;

        if (event.status === 'waiting') {
            const allUsers = await this.userRepository.listUsers();
            const moderators = allUsers.filter(u => u.role === 'moderator' || u.role === 'admin');
            
            const promises = moderators.map(mod => {
                const notification = NotificationEntity.create(
                    uuidv4(),
                    mod.id,
                    NotificationType.POST_PENDING_REVIEW,
                    `Post "${event.title}" is pending review.`,
                    { postId: event.postId, authorId: event.authorId }
                );
                return this.notificationRepository.save(notification);
            });
            await Promise.all(promises);
            return;
        }

        if (event.status === 'accepted') {
            const notifAuthor = NotificationEntity.create(
                uuidv4(),
                event.authorId,
                NotificationType.POST_APPROVED,
                `Your post "${event.title}" has been approved.`,
                { postId: event.postId }
            );
            await this.notificationRepository.save(notifAuthor);

            const [followers] = await this.followRepository.getFollowers(event.authorId);
            const promises = followers.map(follower => {
                const notification = NotificationEntity.create(
                    uuidv4(),
                    follower.id,
                    NotificationType.NEW_POST_FROM_FOLLOWED,
                    `User ${event.authorId} published a new post: ${event.title}`,
                    { postId: event.postId, authorId: event.authorId }
                );
                return this.notificationRepository.save(notification);
            });
            await Promise.all(promises);
            return;
        }

        if (event.status === 'rejected') {
            const notifAuthor = NotificationEntity.create(
                uuidv4(),
                event.authorId,
                NotificationType.POST_REJECTED,
                `Your post "${event.title}" has been rejected.`,
                { postId: event.postId }
            );
            await this.notificationRepository.save(notifAuthor);
            return;
        }
    }

    @OnEvent('post.deleted')
    public async handlePostDeleted(event: { postId: string, authorId: string, title: string, deletedByPath: string }) {
        if (event.authorId === event.deletedByPath) return;

        const notification = NotificationEntity.create(
            uuidv4(),
            event.authorId,
            NotificationType.POST_DELETED,
            `Your post "${event.title}" has been deleted.`,
            { postId: event.postId }
        );
        await this.notificationRepository.save(notification);
    }

    @OnEvent('comment.created')
    public async handleCommentCreated(event: { commentId: string, postId: string, postAuthorId: string, commentAuthorId: string }) {
        if (event.postAuthorId === event.commentAuthorId) {
            return; // Do not notify if user comments on their own post
        }

        const notification = NotificationEntity.create(
            uuidv4(),
            event.postAuthorId,
            NotificationType.NEW_COMMENT,
            `Someone commented on your post.`,
            { commentId: event.commentId, postId: event.postId, commentAuthorId: event.commentAuthorId }
        );
        await this.notificationRepository.save(notification);
    }
}
