import { Arg, Mutation, Resolver } from 'type-graphql';
import * as argon2 from 'argon2';

import { User } from '../entities';
import { RegisterInput, UserMutationResponse } from '../types';

@Resolver()
export default class UserResolver {
    @Mutation(() => UserMutationResponse, { nullable: true })
    async register(
        @Arg('registerInput')
        { username, password, email, address }: RegisterInput
    ): Promise<UserMutationResponse> {
        try {
            const existUser = await User.findOne({
                where: [{ username }, { email }],
            });
            if (existUser)
                return {
                    code: 400,
                    success: false,
                    message: 'Duplicated username or email',
                    errors: [
                        {
                            field: `Duplicated ${
                                existUser.username === username
                                    ? 'username'
                                    : 'email'
                            }`,
                            message: `${
                                existUser.username === username
                                    ? `Username ${username}`
                                    : `Email ${email}`
                            } already taken`,
                        },
                    ],
                };

            const hashPassword = await argon2.hash(password);

            const newUser = User.create({
                username,
                password: hashPassword,
                email,
                address,
            });

            return {
                code: 200,
                success: true,
                message: 'User registration successfully',
                user: await User.save(newUser),
            };
        } catch (error) {
            if (error instanceof Error) {
                // ✅ TypeScript knows err is Error
                console.log(error.message);
                return {
                    code: 500,
                    success: false,
                    message: `Internal server error: ${error.message}`,
                };
            } else {
                console.log('Unexpected error', error);
                return {
                    code: 500,
                    success: false,
                    message: `Internal server error: ${error}`,
                };
            }
        }
    }
}
