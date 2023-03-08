import { MiddlewareFn } from 'type-graphql';
import { IMyContext } from '../types';
import { GraphQLError } from 'graphql';

export const checkAuth: MiddlewareFn<IMyContext> = async (
    { context: { req } },
    next,
) => {
    if (!req.session.userId)
        throw new GraphQLError(
            'Not authenticated to perform GraphQL operations',
        );

    return next();
};

export const checkIsLogin: MiddlewareFn<IMyContext> = async (
    { context: { req } },
    next,
) => {
    if (req.session.userId) throw new GraphQLError('Already login!');

    return next();
};
