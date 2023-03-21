import { Secret, verify } from 'jsonwebtoken';
import { MiddlewareFn } from 'type-graphql';

import { IMyContext } from '../types';
import { roles } from '../constants';
import { UserAuthPayload } from '../types/auth';

export const verifyToken: MiddlewareFn<IMyContext> = async (
    { context },
    next,
) => {
    try {
        // header is Bearer <token>
        const header = context.req.header('Authorization');
        const accessToken = header && header.split(' ')[1];

        if (!accessToken) {
            throw new Error('Not authenticated, no access token');
        }

        const decodedUser = verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET as Secret,
        ) as UserAuthPayload;

        context.user = decodedUser;

        return next();
    } catch (error) {
        throw new Error(`Error authenticating user: ${JSON.stringify(error)}`);
    }
};

export const isAdmin: MiddlewareFn<IMyContext> = async ({ context }, next) => {
    try {
        const rolesString = context.user.roles.map((role) => role.name);
        if (!rolesString.includes(roles.ADMIN)) {
            throw new Error('Not authorized, no admin role');
        }

        return next();
    } catch (error) {
        throw new Error(`Error authenticating user: ${JSON.stringify(error)}`);
    }
};

export const isUser: MiddlewareFn<IMyContext> = async ({ context }, next) => {
    try {
        const rolesString = context.user.roles.map((role) => role.name);
        if (!rolesString.includes(roles.USER)) {
            throw new Error('Not authorized, no user role');
        }

        return next();
    } catch (error) {
        throw new Error(`Error authenticating user: ${JSON.stringify(error)}`);
    }
};
