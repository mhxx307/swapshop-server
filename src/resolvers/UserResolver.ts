import { Arg, Mutation, Resolver } from 'type-graphql';
import * as argon2 from 'argon2';

import { User } from '../entities';
import { LoginInput, RegisterInput } from '../types/input';
import { UserMutationResponse } from '../types/response';
import { validateRegisterInput } from '../validations';

@Resolver()
export default class UserResolver {
    @Mutation(() => UserMutationResponse)
    async register(
        @Arg('registerInput') registerInput: RegisterInput
    ): Promise<UserMutationResponse> {
        const validateRegisterInputErrors =
            validateRegisterInput(registerInput);

        console.log(validateRegisterInputErrors);

        if (validateRegisterInputErrors !== null)
            return {
                code: 400,
                success: false,
                ...validateRegisterInputErrors,
            };

        try {
            const {
                username,
                password,
                email,
                address,
                phoneNumber,
                avatar,
                birthday,
                fullName,
            } = registerInput;

            const existingUser = await User.findOne({
                where: [{ username }, { email }, { phoneNumber }],
            });

            if (existingUser)
                return {
                    code: 400,
                    success: false,
                    message: 'Duplicated username, email or phone number',
                    errors: [
                        {
                            field: `${
                                (existingUser.username === username &&
                                    'username') ||
                                (existingUser.email === email && 'email') ||
                                (existingUser.phoneNumber === phoneNumber &&
                                    'phone number')
                            }`,
                            message: `${
                                (existingUser.username === username &&
                                    `Username ${username}`) ||
                                (existingUser.email === email &&
                                    `Email ${email}`) ||
                                (existingUser.phoneNumber === phoneNumber &&
                                    `Phone number ${phoneNumber}`)
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
                phoneNumber,
                fullName,
                avatar,
                birthday,
            });

            return {
                code: 200,
                success: true,
                message: 'User registration successfully',
                user: await User.save(newUser),
            };
        } catch (error) {
            if (error instanceof Error) {
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

    @Mutation(() => UserMutationResponse)
    async login(
        @Arg('loginInput') loginInput: LoginInput
    ): Promise<UserMutationResponse> {
        try {
            const { usernameOrEmail, password } = loginInput;
            const emailRegex =
                /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
            let existingUser;

            if (emailRegex.test(usernameOrEmail)) {
                existingUser = await User.findOne({
                    where: {
                        email: usernameOrEmail,
                    },
                });
            } else {
                existingUser = await User.findOne({
                    where: {
                        username: usernameOrEmail,
                    },
                });
            }

            if (!existingUser) {
                return {
                    code: 400,
                    success: false,
                    message:
                        'Account does not exist, username or email maybe wrong',
                    errors: [
                        {
                            field: 'usernameOrEmail',
                            message: 'Account does not exist',
                        },
                    ],
                };
            }

            const isValidPassword = await argon2.verify(
                existingUser.password,
                password
            );

            if (!isValidPassword) {
                return {
                    code: 400,
                    success: false,
                    message: 'Wrong password',
                    errors: [
                        {
                            field: 'password',
                            message: 'Wrong password',
                        },
                    ],
                };
            }

            return {
                code: 200,
                success: true,
                message: 'Logged in successfully',
                user: existingUser,
            };
        } catch (error) {
            if (error instanceof Error) {
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
