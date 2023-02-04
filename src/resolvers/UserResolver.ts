import { Arg, Mutation, Resolver } from 'type-graphql';
import * as argon2 from 'argon2';

import { User } from '../entities';
import { RegisterInput, UserMutationResponse } from '../types';
import { validateRegisterInput } from '../utils/validate';

@Resolver()
export default class UserResolver {
    @Mutation(() => UserMutationResponse, { nullable: true })
    async register(
        @Arg('registerInput') registerInput: RegisterInput
    ): Promise<UserMutationResponse> {
        const validateRegisterInputErrors =
            validateRegisterInput(registerInput);

        if (validateRegisterInputErrors !== null)
            return {
                code: 400,
                success: false,
                ...validateRegisterInputErrors,
            };

        try {
            const { username, password, email, address, phoneNumber, avatar } =
                registerInput;

            const existUser = await User.findOne({
                where: [{ username }, { email }, { phoneNumber }],
            });

            if (existUser)
                return {
                    code: 400,
                    success: false,
                    message: 'Duplicated username, email or phone number',
                    errors: [
                        {
                            field: `Duplicated ${
                                (existUser.username === username &&
                                    'username') ||
                                (existUser.email === email && 'email') ||
                                (existUser.phoneNumber === phoneNumber &&
                                    'phone number')
                            }`,
                            message: `${
                                (existUser.username === username &&
                                    `Username ${username}`) ||
                                (existUser.email === email &&
                                    `Email ${email}`) ||
                                (existUser.phoneNumber === phoneNumber &&
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
                avatar,
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
}
