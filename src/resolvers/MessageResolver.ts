import { InsertMessageInput } from '../types/input';
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
    UseMiddleware,
} from 'type-graphql';

import { showError } from '../utils';
import { Conversation, Message, User } from '../entities';
import { MessageMutationResponse } from '../types/response';
import { IMyContext } from '../types/context';
import { checkAuth } from '../middleware/session';

@Resolver(() => Message)
export default class MessageResolver {
    @FieldResolver(() => User)
    async sender(
        @Root() root: Message,
        @Ctx() { dataLoaders: { userLoader } }: IMyContext,
    ) {
        return await userLoader.load(root.senderId);
    }

    @FieldResolver(() => Conversation)
    async conversation(
        @Root() root: Message,
        @Ctx() { dataLoaders: { conversationLoader } }: IMyContext,
    ) {
        return await conversationLoader.load(root.conversationId);
    }

    // save new message
    @Subscription(() => MessageMutationResponse, {
        topics: 'SEND_MESSAGE_PRIVATE', // topic for comments/messages
    })
    async messageIncoming(
        @Root() payload: Message,
    ): Promise<MessageMutationResponse> {
        try {
            return {
                code: 200,
                success: true,
                message: 'Message created successfully',
                createdMessage: payload,
            };
        } catch (error) {
            return showError(error);
        }
    }

    // add new message
    @Mutation(() => MessageMutationResponse)
    @UseMiddleware(checkAuth)
    async insertMessage(
        @Arg('insertMessageInput') insertMessageInput: InsertMessageInput,
        @PubSub() pubSub: PubSubEngine,
    ): Promise<MessageMutationResponse> {
        try {
            const newMessage = Message.create(insertMessageInput);
            console.log('test', newMessage);

            const message = await newMessage.save();
            await pubSub.publish('SEND_MESSAGE_PRIVATE', message);

            return {
                code: 200,
                success: true,
                message: 'Message inserted successfully',
            };
        } catch (error) {
            return showError(error);
        }
    }

    // get all messages by conversation id
    @Query(() => [Message], { nullable: true })
    @UseMiddleware(checkAuth)
    async messages(
        @Arg('conversationId') conversationId: string,
    ): Promise<Message[] | null> {
        return await Message.find({
            where: { conversationId },
            order: { createdDate: 'ASC' },
        });
    }

    @Subscription(() => MessageMutationResponse, {
        topics: 'DELETED_MESSAGE', // topic for comments/messages
    })
    async deletedMessage(
        @Root() payload: Message,
    ): Promise<MessageMutationResponse> {
        try {
            await Message.remove(payload);

            return {
                code: 200,
                success: true,
                message: 'Message deleted successfully',
            };
        } catch (error) {
            return showError(error);
        }
    }

    // remove message
    @Mutation(() => MessageMutationResponse)
    @UseMiddleware(checkAuth)
    async removeMessage(
        @Arg('messageId') messageId: string,
        @Ctx() { req }: IMyContext,
        @PubSub() pubSub: PubSubEngine,
    ): Promise<MessageMutationResponse> {
        try {
            const message = await Message.findOne({ where: { id: messageId } });

            if (!message) {
                return {
                    code: 404,
                    success: false,
                    message: 'Message not found',
                };
            }

            if (message.senderId !== req.session.userId) {
                return {
                    code: 401,
                    success: false,
                    message: 'You are not authorized to delete this message',
                };
            }

            await pubSub.publish('DELETED_MESSAGE', message);

            return {
                code: 200,
                success: true,
                message: 'Message deleted successfully',
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Subscription(() => MessageMutationResponse, {
        topics: 'UPDATED_MESSAGE', // topic for comments/messages
    })
    async updatedMessage(
        @Root() payload: Message,
    ): Promise<MessageMutationResponse> {
        try {
            await payload.save();

            return {
                code: 200,
                success: true,
                message: 'Message updated successfully',
                createdMessage: payload,
            };
        } catch (error) {
            return showError(error);
        }
    }

    // update message
    @Mutation(() => MessageMutationResponse)
    @UseMiddleware(checkAuth)
    async updateMessage(
        @Arg('messageId') messageId: string,
        @Arg('text') text: string,
        @Ctx() { req }: IMyContext,
        @PubSub() pubSub: PubSubEngine,
    ): Promise<MessageMutationResponse> {
        try {
            const message = await Message.findOne({ where: { id: messageId } });

            if (!message) {
                return {
                    code: 404,
                    success: false,
                    message: 'Message not found',
                };
            }

            if (message.senderId !== req.session.userId) {
                return {
                    code: 401,
                    success: false,
                    message: 'You are not authorized to update this message',
                };
            }

            message.text = text;

            await pubSub.publish('UPDATED_MESSAGE', message);

            return {
                code: 200,
                success: true,
                message: 'Message updated successfully',
            };
        } catch (error) {
            return showError(error);
        }
    }
}
