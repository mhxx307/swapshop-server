import express from 'express';
import { Secret, verify } from 'jsonwebtoken';

import { UserAuthPayload } from '../types/auth';
import { REFRESH_TOKEN_COOKIE_NAME } from '../constants';
import { User } from '../entities';
import { createToken, sendRefreshToken } from '../utils/auth';

const router = express.Router();

router.get('/', async (req, res) => {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

    if (!refreshToken) {
        return res.sendStatus(401);
    }

    try {
        const decodedUser = verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as Secret,
        ) as UserAuthPayload;

        console.log(decodedUser);

        const existingUser = await User.findOne({
            where: {
                id: decodedUser.userId,
            },
        });

        if (
            !existingUser ||
            existingUser.tokenVersion !== decodedUser.tokenVersion
        ) {
            return res.sendStatus(401);
        }

        await sendRefreshToken(res, existingUser);

        return res.status(200).json({
            success: true,
            accessToken: await createToken({
                type: 'accessToken',
                user: existingUser,
            }),
        });
    } catch (error) {
        return res.status(403).json({ success: false, error: error });
    }
});

export default router;
