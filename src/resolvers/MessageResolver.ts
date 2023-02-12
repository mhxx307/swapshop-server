import { Arg, Mutation, Resolver } from 'type-graphql';
import { Message } from '../entities';

import MessageInput from '../types/input/MessageInput';
import MessageMutationResponse from '../types/response/MessageMutationResponse';

@Resolver()
export default class MessageResolver {
    @Mutation(() => MessageMutationResponse)
    async createdMessage(
        @Arg('messageInput') messageInput: MessageInput
    ): Promise<MessageMutationResponse> {
        try {
            const { content, status, user } = messageInput;

            const newMessage = Message.create({ content, status, user });

            return {
                code: 200,
                success: true,
                message: 'Message create successfully',
                createdMessage: await Message.save(newMessage),
            };
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
                return {
                    code: 500,
                    success: false,
                    message: `Internal server error: ${error.message}`,
                };
            } else {
                console.log('Unexpected error', error);
                return {
                    code: 500,
                    success: false,
                    message: `Internal server error: ${error}`,
                };
            }
        }
    }
}
