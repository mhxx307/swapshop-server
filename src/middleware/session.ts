import { MiddlewareFn } from 'type-graphql';
import { GraphQLError } from 'graphql';
import { findRoles } from '../utils/user';
import { IMyContext } from '../types/context';

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

export const checkAlreadyLogin: MiddlewareFn<IMyContext> = async (
    { context: { req } },
    next,
) => {
    if (req.session.userId) throw new GraphQLError('Already login!');

    return next();
};

export const checkAdmin: MiddlewareFn<IMyContext> = async (
    { context: { req } },
    next,
) => {
    if (!req.session.userId) {
        throw new GraphQLError(
            'Not authenticated to perform GraphQL operations',
        );
    }

    const roles = await findRoles(req.session.userId);

    if (!roles.find((role) => role.name === 'admin')) {
        throw new GraphQLError('Not authorized to perform GraphQL operations');
    }

    return next();
};
