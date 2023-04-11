import { InsertMessageInput } from '../types/input';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';

import { showError } from '../utils';
import { Message, User } from '../entities';
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

    // add new message
    @Mutation(() => MessageMutationResponse)
    @UseMiddleware(checkAuth)
    async newMessage(
        @Arg('insertMessageInput') insertMessageInput: InsertMessageInput,
    ): Promise<MessageMutationResponse> {
        try {
            const { conversationId, senderId, text, images } =
                insertMessageInput;

            const newMessage = Message.create({
                senderId,
                conversationId,
                text,
                images,
            });

            return {
                code: 200,
                success: true,
                message: 'Message created successfully',
                createdMessage: await newMessage.save(),
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
        return await Message.find({ where: { conversationId } });
    }

    // remove message
    @Mutation(() => MessageMutationResponse)
    @UseMiddleware(checkAuth)
    async removeMessage(
        @Arg('messageId') messageId: string,
        @Ctx() { req }: IMyContext,
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

            await Message.remove(message);

            return {
                code: 200,
                success: true,
                message: 'Message deleted successfully',
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

            return {
                code: 200,
                success: true,
                message: 'Message updated successfully',
                createdMessage: await message.save(),
            };
        } catch (error) {
            return showError(error);
        }
    }
}
