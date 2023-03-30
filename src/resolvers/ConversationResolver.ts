import { Conversation, User } from '../entities';
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

import { IMyContext } from '../types/context';
import { ConversationMutationResponse } from '../types/response';
import { checkAuth } from '../middleware/session';
import { In } from 'typeorm';

@Resolver(() => Conversation)
export default class ConversationResolver {
    @FieldResolver(() => [User])
    async members(
        @Root() root: Conversation,
        @Ctx() { dataLoaders: { userLoader } }: IMyContext,
    ) {
        return root.memberIds.map(async (id) => await userLoader.load(id));
    }

    @Mutation(() => ConversationMutationResponse)
    @UseMiddleware(checkAuth)
    async newConversation(
        @Arg('userId') userId: string,
        @Ctx() { req }: IMyContext,
    ): Promise<ConversationMutationResponse> {
        try {
            if (req.session.userId === userId) {
                return {
                    code: 400,
                    success: false,
                    message: 'You cannot send a message to yourself',
                };
            }

            const memberIds = [req.session.userId as string, userId];

            if (memberIds.length > 0) {
                const members = memberIds.map((member) => [member]);

                const existConversation = await Conversation.findOne({
                    where: {
                        memberIds: In(members),
                    },
                });

                if (existConversation) {
                    return {
                        code: 200,
                        success: true,
                        message: 'Conversation already exist',
                        conversation: existConversation,
                    };
                }
            }

            const newConversation = Conversation.create({
                memberIds,
            });

            return {
                code: 200,
                success: true,
                message: 'Conversation created successfully',
                conversation: await newConversation.save(),
            };
        } catch (error) {
            return {
                code: 500,
                success: false,
                message: 'Internal server error',
            };
        }
    }

    //get conv of a user
    @Query(() => [Conversation])
    @UseMiddleware(checkAuth)
    async getConversations(
        @Ctx() { req }: IMyContext,
    ): Promise<Conversation[] | null> {
        try {
            const conversations = await Conversation.find({
                where: {
                    memberIds: In([req.session.userId as string]),
                },
            });

            return conversations;
        } catch (error) {
            return null;
        }
    }

    // get conv includes two userId
    @Query(() => Conversation, { nullable: true })
    @UseMiddleware(checkAuth)
    async getConversation(
        @Arg('userId') userId: string,
        @Ctx() { req }: IMyContext,
    ): Promise<Conversation | null> {
        try {
            const conversation = await Conversation.findOne({
                where: {
                    memberIds: In([[req.session.userId as string, userId]]),
                },
            });

            return conversation || null;
        } catch (error) {
            return null;
        }
    }
}
