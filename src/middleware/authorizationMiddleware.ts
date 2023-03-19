import { IMyContext } from '../types';
import { MiddlewareFn } from 'type-graphql';
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
