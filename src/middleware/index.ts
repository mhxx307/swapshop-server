import { MiddlewareFn } from 'type-graphql';
import { IMyContext } from '../types';
import { GraphQLError } from 'graphql';
import { Article } from '../entities';

export const checkAuth: MiddlewareFn<IMyContext> = async (
    { context: { req } },
    next
) => {
    if (!req.session.userId)
        throw new GraphQLError(
            'Not authenticated to perform GraphQL operations'
        );

    return next();
};

export const checkIsLogin: MiddlewareFn<IMyContext> = async (
    { context: { req } },
    next
) => {
    if (req.session.userId) throw new GraphQLError('Already login!');

    return next();
};

export const checkArticleBelongTo: MiddlewareFn<IMyContext> = async (
    { context: { req }, args },
    next
) => {
    // check if the article belongs to the logged in user
    const existingArticle = await Article.findOne({
        where: {
            id: args.id,
        },
    });

    if (!existingArticle) {
        return {
            code: 400,
            success: false,
            message: 'Article not found',
        };
    }

    // if (existingArticle.user.id !== req.session.userId) {
    //     return {
    //         code: 401,
    //         success: false,
    //         message: 'Not authorized',
    //     };
    // }

    return next();
};
