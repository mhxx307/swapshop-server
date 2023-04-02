import { User, Conversation } from '../entities';
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

@Resolver(() => Conversation)
export default class ConversationResolver {
    @FieldResolver(() => [User])
    async member1(
        @Root() root: Conversation,
        @Ctx() { dataLoaders: { userLoader } }: IMyContext,
    ) {
        return await userLoader.load(root.member1Id);
    }

    @FieldResolver(() => [User])
    async member2(
        @Root() root: Conversation,
        @Ctx() { dataLoaders: { userLoader } }: IMyContext,
    ) {
        return await userLoader.load(root.member2Id);
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

            const existConversation = await Conversation.findOne({
                where: [
                    { member1Id: req.session.userId, member2Id: userId },
                    { member1Id: userId, member2Id: req.session.userId },
                ],
            });

            if (existConversation) {
                return {
                    code: 200,
                    success: true,
                    message: 'Conversation already exist',
                    conversation: existConversation,
                };
            }

            const newConversation = Conversation.create({
                member1Id: req.session.userId,
                member2Id: userId,
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
    @Query(() => [Conversation], { nullable: true })
    @UseMiddleware(checkAuth)
    async getConversations(
        @Ctx() { req }: IMyContext,
    ): Promise<Conversation[] | null> {
        try {
            const conversations = await Conversation.find({
                where: [
                    { member1Id: req.session.userId },
                    { member2Id: req.session.userId },
                ],
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
            // getConversation between two users
            const conversation = await Conversation.findOne({
                where: [
                    { member1Id: req.session.userId, member2Id: userId },
                    { member1Id: userId, member2Id: req.session.userId },
                ],
            });

            return conversation || null;
        } catch (error) {
            return null;
        }
    }
}
