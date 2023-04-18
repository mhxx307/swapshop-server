import { Notification } from '../entities';
import {
    Arg,
    Ctx,
    Mutation,
    PubSub,
    PubSubEngine,
    Query,
    Root,
    Subscription,
} from 'type-graphql';

import { showError } from '../utils';
import { NotificationMutationResponse } from '../types/response';
import { IMyContext } from 'src/types/context';

export default class NotificationResolver {
    @Subscription(() => NotificationMutationResponse, {
        topics: 'NOTIFICATIONS_PRIVATE', // topic for comments/messages
        filter: ({ payload, args }) => {
            return payload.recipientId === args.userId;
        },
    })
    async newNotificationPrivate(
        @Root() payload: any,
        @Arg('userId') userId: string,
    ): Promise<NotificationMutationResponse> {
        const newNotification = Notification.create({
            content: payload.content,
            userId: payload.recipientId,
        });

        return {
            code: 200,
            success: true,
            message: 'Notification created successfully',
            notification: await newNotification.save(),
        };
    }

    @Subscription(() => NotificationMutationResponse, {
        topics: 'NOTIFICATIONS', // topic for public notifications
    })
    async newNotification(
        @Root() payload: any,
    ): Promise<NotificationMutationResponse> {
        const newNotification = Notification.create({
            content: payload.content,
        });

        return {
            code: 200,
            success: true,
            message: 'Notification created successfully',
            notification: await newNotification.save(),
        };
    }

    @Mutation(() => NotificationMutationResponse)
    async pushPrivateNotification(
        @Arg('content') content: string,
        @Arg('recipientId') recipientId: string,
        @PubSub() pubSub: PubSubEngine,
    ): Promise<NotificationMutationResponse> {
        try {
            const payload = {
                content,
                recipientId,
            };
            await pubSub.publish('NOTIFICATIONS_PRIVATE', payload);

            return {
                code: 200,
                success: true,
                message: 'Notification created successfully',
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Mutation(() => NotificationMutationResponse)
    async pushNotification(
        @Arg('content') content: string,
        @PubSub() pubSub: PubSubEngine,
    ): Promise<NotificationMutationResponse> {
        try {
            const payload = {
                content,
            };
            await pubSub.publish('NOTIFICATIONS', payload);

            return {
                code: 200,
                success: true,
                message: 'Notification created successfully',
            };
        } catch (error) {
            return showError(error);
        }
    }

    // @Query(() => [Notification], { nullable: true })
    // async notificationsPrivate(
    //     @Ctx() { req }: IMyContext,
    // ): Promise<Notification[] | null> {
    //     return await Notification.find({
    //         where: { userId: req.session.userId },
    //         order: { createdDate: 'DESC' },
    //     });
    // }

    // @Query(() => [Notification], { nullable: true })
    // async notificationsPublic(): Promise<Notification[] | null> {
    //     return await Notification.find({
    //         where: { userId: null },
    //         order: { createdDate: 'DESC' },
    //     });
    // }

    @Query(() => [Notification], { nullable: true })
    async notifications(
        @Ctx() { req }: IMyContext,
    ): Promise<Notification[] | null> {
        const notificationsPrivate = await Notification.find({
            where: { userId: req.session.userId },
            order: { createdDate: 'DESC' },
        });

        const notificationsPublic = await Notification.find({
            where: { userId: null },
            order: { createdDate: 'DESC' },
        });

        return [...notificationsPrivate, ...notificationsPublic];
    }

    @Mutation(() => NotificationMutationResponse)
    async deleteNotification(
        @Arg('id') id: string,
    ): Promise<NotificationMutationResponse> {
        try {
            const notification = await Notification.findOne({ where: { id } });

            if (!notification) {
                return {
                    code: 404,
                    success: false,
                    message: 'Notification not found',
                };
            }

            await notification.remove();

            return {
                code: 200,
                success: true,
                message: 'Notification deleted successfully',
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Mutation(() => NotificationMutationResponse)
    async deleteAllNotifications(): Promise<NotificationMutationResponse> {
        try {
            await Notification.delete({});

            return {
                code: 200,
                success: true,
                message: 'All notifications deleted successfully',
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Mutation(() => NotificationMutationResponse)
    async deleteAllNotificationsPrivate(
        @Ctx() { req }: IMyContext,
    ): Promise<NotificationMutationResponse> {
        try {
            await Notification.delete({
                userId: req.session.userId,
            });

            return {
                code: 200,
                success: true,
                message: 'All private notifications deleted successfully',
            };
        } catch (error) {
            return showError(error);
        }
    }
}
