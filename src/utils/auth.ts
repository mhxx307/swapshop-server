import { Response } from 'express';
import { Secret, sign } from 'jsonwebtoken';
import { REFRESH_TOKEN_COOKIE_NAME, __prod__ } from '../constants';
import { Role, User } from '../entities';

interface CreateTokenProps {
    type: 'accessToken' | 'refreshToken';
    user: User;
}

export const findRoles = async (user: User) => {
    // find roles of user from database
    const roles = await Role.find({
        relations: ['users'],
        where: {
            users: {
                userId: user.id,
            },
        },
    });

    const rolesAuth = roles.map((role) => ({
        id: role.id,
        name: role.name,
    }));

    return rolesAuth;
};

export const createToken = async ({ type, user }: CreateTokenProps) =>
    sign(
        {
            userId: user.id,
            roles: await findRoles(user),
            ...(type === 'refreshToken'
                ? { tokenVersion: user.tokenVersion }
                : {}),
        },
        type === 'accessToken'
            ? (process.env.ACCESS_TOKEN_SECRET as Secret)
            : (process.env.REFRESH_TOKEN_SECRET as Secret),
        {
            expiresIn: type === 'accessToken' ? '15m' : '7d',
        },
    );

export const sendRefreshToken = async (res: Response, user: User) => {
    res.cookie(
        REFRESH_TOKEN_COOKIE_NAME,
        await createToken({
            type: 'refreshToken',
            user,
        }),
        {
            httpOnly: true,
            sameSite: 'lax',
            secure: __prod__,
            path: '/refresh_token',
        },
    );
};
