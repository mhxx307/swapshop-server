import { JwtPayload } from 'jsonwebtoken';

export type UserAuth = {
    userId: string;
    roles: {
        id: string;
        name: string;
    }[];
    tokenVersion?: number;
};

export type UserAuthPayload = JwtPayload & UserAuth;
