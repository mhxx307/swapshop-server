import { Notification, User } from '../entities';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
} from 'type-graphql';

import { showError } from '../utils';
import { NotificationMutationResponse } from '../types/response';
import { IMyContext } from 'src/types/context';

@Resolver(() => Notification)
export default class NotificationResolver {
    @FieldResolver(() => User)
    async user(
        @Root() root: Notification,
        @Ctx() { dataLoaders: { userLoader } }: IMyContext,
    ) {
        return await userLoader.load(root.userId);
    }

    @Mutation(() => NotificationMutationResponse)
    async insertNotification(
        @Arg('content') content: string,
        @Arg('userId') userId: string,
    ): Promise<NotificationMutationResponse> {
        try {
            const newNotification = Notification.create({
                content,
                userId,
            });

            return {
                code: 200,
                success: true,
                message: 'Notification created successfully',
                notification: await newNotification.save(),
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Query(() => [Notification], { nullable: true })
    async notificationsPrivate(
        @Ctx() { req }: IMyContext,
    ): Promise<Notification[] | null> {
        return await Notification.find({
            where: { userId: req.session.userId },
        });
    }

    @Query(() => [Notification], { nullable: true })
    async notificationsPublic(): Promise<Notification[] | null> {
        return await Notification.find({
            where: { userId: null },
        });
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
