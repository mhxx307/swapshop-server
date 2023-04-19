import { Notification, User } from '../entities';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    PubSub,
    PubSubEngine,
    Query,
    Resolver,
    Root,
    Subscription,
} from 'type-graphql';

import { showError } from '../utils';
import { NotificationMutationResponse } from '../types/response';
import { IMyContext } from 'src/types/context';
import { In } from 'typeorm';

@Resolver(() => Notification)
export default class NotificationResolver {
    @FieldResolver(() => User)
    async user(
        @Root() root: Notification,
        @Ctx() { dataLoaders: { userLoader } }: IMyContext,
    ) {
        return await userLoader.load(root.userId);
    }

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
    async deleteNotifications(
        @Arg('ids', () => [String]) ids: string[],
    ): Promise<NotificationMutationResponse> {
        try {
            await Notification.delete({
                id: In(ids),
            });

            return {
                code: 200,
                success: true,
                message: 'Notification deleted successfully',
            };
        } catch (error) {
            return showError(error);
        }
    }
}
