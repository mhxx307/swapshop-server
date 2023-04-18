import { STATUS_USER } from './../constants/user';
import * as argon2 from 'argon2';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { v4 as uuidv4 } from 'uuid';

import { COOKIE_NAME, USER_ROLES, __prod__ } from '../constants';
import { Role, User, UserRole } from '../entities';
import {
    checkAdmin,
    checkAlreadyLogin,
    checkAuth,
} from '../middleware/session';
import { TokenModel } from '../models';
import { IMyContext } from '../types/context';
import {
    ChangePasswordInput,
    ChangePasswordLoggedInput,
    ForgotPasswordInput,
    LoginInput,
    RegisterInput,
    UpdateProfileInput,
} from '../types/input';
import { UserMutationResponse } from '../types/response';
import { sendEmail, showError } from '../utils';
import {
    validateChangePasswordInput,
    validateChangePasswordLoggedInput,
    validateRegisterInput,
} from '../validations';
import { Like } from 'typeorm';

@Resolver(() => User)
export default class UserResolver {
    @FieldResolver(() => [UserRole])
    async roles(@Root() root: User) {
        return await UserRole.find({
            where: { userId: root.id },
            relations: ['role'],
        });
    }

    @Query(() => User, { nullable: true })
    async me(@Ctx() { req }: IMyContext): Promise<User | undefined | null> {
        const userId = req.session.userId;
        if (!userId) return null;
        const user = await User.findOne({ where: { id: userId } });
        return user;
    }

    @Mutation(() => UserMutationResponse)
    @UseMiddleware(checkAlreadyLogin)
    async register(
        @Arg('registerInput') registerInput: RegisterInput,
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
            const { username, password, email, fullName } = registerInput;

            const existingUser = await User.findOne({
                where: [{ username }, { email }],
            });

            if (existingUser)
                return {
                    code: 400,
                    success: false,
                    message: 'Duplicated username, email',
                    errors: [
                        {
                            field: `${
                                (existingUser.username === username &&
                                    'username') ||
                                (existingUser.email === email && 'email')
                            }`,
                            message: `${
                                (existingUser.username === username &&
                                    `Username ${username}`) ||
                                (existingUser.email === email &&
                                    `Email ${email}`)
                            } already taken`,
                        },
                    ],
                };

            const hashPassword = await argon2.hash(password);

            const newUser = User.create({
                username,
                password: hashPassword,
                email,
                fullName,
            });

            const savedUser = await newUser.save();
            const role = await Role.findOne({
                where: { name: USER_ROLES.USER },
            });

            await UserRole.create({
                userId: savedUser.id,
                roleId: role?.id,
            }).save();

            // start: Send email to user
            await TokenModel.findOneAndDelete({ userId: `${savedUser.id}` });

            const verifyToken = uuidv4();
            const hashedVerifyToken = await argon2.hash(verifyToken);

            await new TokenModel({
                userId: `${savedUser.id}`,
                token: hashedVerifyToken,
            }).save();

            await sendEmail(
                email,
                `<a href="https://secondchance.vercel.app/verify-email?token=${verifyToken}&userId=${savedUser.id}">Click here to verify your email</a> - Do not send this link to other`,
                'Verify your email',
            );
            // end: Send email to user

            return {
                code: 200,
                success: true,
                message: 'User registration successfully',
                user: savedUser,
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Mutation(() => UserMutationResponse)
    async verifyEmail(
        @Arg('token') token: string,
        @Arg('userId') userId: string,
        @Ctx() { req }: IMyContext,
    ): Promise<UserMutationResponse> {
        try {
            const verifyTokenRecord = await TokenModel.findOne({
                userId,
            });

            if (!verifyTokenRecord) {
                return {
                    code: 400,
                    success: false,
                    message: 'Invalid or expired verify token',
                    errors: [
                        {
                            field: 'token',
                            message: 'Invalid or expired verify token',
                        },
                    ],
                };
            }

            const verifyTokenValid = argon2.verify(
                verifyTokenRecord.token,
                token,
            );

            if (!verifyTokenValid) {
                return {
                    code: 400,
                    success: false,
                    message: 'Invalid or expired verify token',
                    errors: [
                        {
                            field: 'token',
                            message: 'Invalid or expired verify token',
                        },
                    ],
                };
            }

            const user = await User.findOne({ where: { id: userId } });

            if (!user) {
                return {
                    code: 400,
                    success: false,
                    message: 'User no longer exists',
                    errors: [
                        { field: 'token', message: 'User no longer exists' },
                    ],
                };
            }

            await User.update({ id: userId }, { isVerified: true });
            await verifyTokenRecord.deleteOne();
            req.session.userId = userId;
            return {
                code: 200,
                success: true,
                message: 'User verify successfully',
                user,
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Mutation(() => UserMutationResponse)
    @UseMiddleware(checkAuth)
    async updateProfile(
        @Arg('updateProfileInput') updateProfileInput: UpdateProfileInput,
        @Ctx() { req }: IMyContext,
    ): Promise<UserMutationResponse> {
        try {
            const { username, address, phoneNumber, birthday, fullName } =
                updateProfileInput;

            const existingUser = await User.findOne({
                where: {
                    id: req.session.userId,
                },
            });

            const duplicateUser = await User.findOne({
                where: {
                    username: username,
                },
            });

            if (!existingUser)
                return {
                    code: 400,
                    success: false,
                    message: 'User not found',
                };

            if (existingUser.id !== req.session.userId) {
                return {
                    code: 401,
                    success: false,
                    message: 'Unauthorized',
                };
            }

            if (
                username === duplicateUser?.username &&
                duplicateUser.id !== existingUser.id
            ) {
                return {
                    code: 400,
                    success: false,
                    message: 'Duplicate username',
                };
            }

            existingUser.username = username;
            existingUser.address = address;
            existingUser.phoneNumber = phoneNumber;
            existingUser.birthday = birthday;
            existingUser.fullName = fullName;

            return {
                code: 200,
                success: true,
                message: 'Delete successfully',
                user: await existingUser.save(),
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Mutation(() => UserMutationResponse)
    @UseMiddleware(checkAlreadyLogin)
    async login(
        @Arg('loginInput') loginInput: LoginInput,
        @Ctx() { req }: IMyContext,
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
                password,
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

            if (existingUser.status === STATUS_USER.BLOCKED) {
                return {
                    code: 400,
                    success: false,
                    message: 'Your account is blocked',
                    errors: [
                        {
                            field: 'status',
                            message: 'Your account is blocked',
                        },
                    ],
                };
            }

            if (existingUser.isVerified === false) {
                return {
                    code: 400,
                    success: false,
                    message: 'Your account is not verified',
                };
            }

            req.session.userId = existingUser.id;

            return {
                code: 200,
                success: true,
                message: 'Logged in successfully',
                user: existingUser,
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Mutation(() => UserMutationResponse)
    @UseMiddleware(checkAlreadyLogin)
    async loginDashboardAdmin(
        @Arg('loginInput') loginInput: LoginInput,
        @Ctx() { req, dataLoaders: { roleLoader } }: IMyContext,
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
                password,
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

            if (existingUser.isVerified === false) {
                return {
                    code: 400,
                    success: false,
                    message: 'Your account is not verified',
                };
            }

            // get all role by UserRole table and validate
            const userRoles = await UserRole.find({
                where: {
                    userId: existingUser.id,
                },
            });

            const roleIds = userRoles.map((userRole) => userRole.roleId);

            const roles = await Promise.all(
                roleIds.map((roleId) => {
                    async function getRole() {
                        return await roleLoader.load(roleId);
                    }
                    return getRole();
                }),
            );

            if (roles.length > 0) {
                const isAdmin = (roles as Role[]).some(
                    (role) => role.name === USER_ROLES.ADMIN,
                );

                if (!isAdmin) {
                    return {
                        code: 403,
                        success: false,
                        message: 'You are not admin',
                    };
                }
            }

            req.session.userId = existingUser.id;

            return {
                code: 200,
                success: true,
                message: 'Logged in successfully',
                user: existingUser,
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Mutation(() => Boolean)
    @UseMiddleware(checkAuth)
    async logout(@Ctx() { req, res }: IMyContext) {
        console.log(req.session.userId);
        return new Promise((resolve) => {
            res.clearCookie(COOKIE_NAME);
            req.session.destroy((error) => {
                if (error) {
                    console.log('DESTROY SESSION ERROR', error);
                    resolve(false);
                }
                resolve(true);
            });
        });
    }

    @Mutation(() => UserMutationResponse)
    async forgotPassword(
        @Arg('forgotPasswordInput') { email }: ForgotPasswordInput,
    ): Promise<UserMutationResponse> {
        try {
            const user = await User.findOne({
                where: { email: email },
            });

            if (!user)
                return {
                    code: 401,
                    success: false,
                    message: 'User do not exist',
                };

            await TokenModel.findOneAndDelete({ userId: `${user.id}` });

            const resetToken = uuidv4();
            const hashedResetToken = await argon2.hash(resetToken);

            // save token to db
            await new TokenModel({
                userId: `${user.id}`,
                token: hashedResetToken,
            }).save();

            // send reset password link to user via email
            await sendEmail(
                email,
                `<a href="${
                    __prod__
                        ? 'https://secondchance.vercel.app/'
                        : 'http://localhost:3000/'
                }change-password?token=${resetToken}&userId=${
                    user.id
                }">Click here to reset your password</a> - Do not send this link to other`,
                'Change password',
            );

            return {
                code: 200,
                success: true,
                message: 'Email send successfully! Please check your inbox',
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Mutation(() => UserMutationResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('userId') userId: string,
        @Arg('changePasswordInput') changePasswordInput: ChangePasswordInput,
    ): Promise<UserMutationResponse> {
        const validateChangePasswordError =
            validateChangePasswordInput(changePasswordInput);
        if (validateChangePasswordError) {
            return {
                code: 400,
                success: false,
            };
        }

        try {
            const { newPassword } = changePasswordInput;
            const resetPasswordTokenRecord = await TokenModel.findOne({
                userId,
            });

            if (!resetPasswordTokenRecord) {
                return {
                    code: 400,
                    success: false,
                    message: 'Invalid or expired password reset token',
                    errors: [
                        {
                            field: 'token',
                            message: 'Invalid or expired password reset token',
                        },
                    ],
                };
            }

            const resetPasswordTokenValid = argon2.verify(
                resetPasswordTokenRecord.token,
                token,
            );

            if (!resetPasswordTokenValid) {
                return {
                    code: 400,
                    success: false,
                    message: 'Invalid or expired password reset token',
                    errors: [
                        {
                            field: 'token',
                            message: 'Invalid or expired password reset token',
                        },
                    ],
                };
            }

            const user = await User.findOne({ where: { id: userId } });

            if (!user) {
                return {
                    code: 400,
                    success: false,
                    message: 'User no longer exists',
                    errors: [
                        { field: 'token', message: 'User no longer exists' },
                    ],
                };
            }

            const updatedPassword = await argon2.hash(newPassword);
            await User.update({ id: userId }, { password: updatedPassword });

            await resetPasswordTokenRecord.deleteOne();

            // req.session.userId = user.id;

            return {
                code: 200,
                success: true,
                message: 'User password reset successfully',
                user,
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Mutation(() => UserMutationResponse)
    @UseMiddleware(checkAuth)
    async changePasswordLogged(
        @Arg('changePasswordLoggedInput')
        changePasswordLoggedInput: ChangePasswordLoggedInput,
        @Ctx() { req }: IMyContext,
    ): Promise<UserMutationResponse> {
        const validateChangePasswordError = validateChangePasswordLoggedInput(
            changePasswordLoggedInput,
        );
        if (validateChangePasswordError) {
            return {
                code: 400,
                success: false,
            };
        }

        try {
            const userId = req.session.userId;
            const { oldPassword, newPassword } = changePasswordLoggedInput;

            const user = await User.findOne({ where: { id: userId } });
            const password = user?.password;

            if (password) {
                const matchOldPass = await argon2.verify(password, oldPassword);

                const oldMatchNewPass = await argon2.verify(
                    password,
                    newPassword,
                );

                if (!matchOldPass) {
                    return {
                        code: 400,
                        success: false,
                        message: 'wrong old password',
                        errors: [
                            {
                                field: 'password',
                                message: 'wrong old password',
                            },
                        ],
                    };
                }

                if (oldMatchNewPass) {
                    return {
                        code: 400,
                        success: false,
                        message: 'Same old password',
                        errors: [
                            {
                                field: 'newPassword',
                                message: 'Same old password',
                            },
                        ],
                    };
                }
            }

            if (!user) {
                return {
                    code: 400,
                    success: false,
                    message: 'User no longer exists',
                    errors: [
                        { field: 'user', message: 'User no longer exists' },
                    ],
                };
            }

            const updatedPassword = await argon2.hash(newPassword);
            await User.update({ id: userId }, { password: updatedPassword });

            return {
                code: 200,
                success: true,
                message: 'User password reset successfully',
                user,
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Query(() => User, { nullable: true })
    async getUserById(
        @Arg('userId') userId: string,
    ): Promise<User | null | undefined> {
        const user = await User.findOne({ where: { id: userId } });
        return user;
    }

    @Query(() => [User], { nullable: true })
    async getUsersByName(
        @Arg('name') name: string,
        @Ctx() { req }: IMyContext,
    ): Promise<User[] | null> {
        const users = await User.find({
            where: { username: Like(`%${name}%`) },
        });
        const usersExceptMe = users.filter(
            (user) => user.id !== req.session.userId,
        );
        return usersExceptMe;
    }

    @Query(() => [User], { nullable: true })
    async getAllUser(): Promise<User[] | null> {
        const users = await User.find();
        return users;
    }

    @Mutation(() => UserMutationResponse)
    @UseMiddleware(checkAuth)
    async deleteUser(
        @Arg('userId') userId: string,
        @Ctx() { req }: IMyContext,
    ): Promise<UserMutationResponse> {
        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return {
                code: 400,
                success: false,
                message: 'User no longer exists',
                errors: [{ field: 'user', message: 'User no longer exists' }],
            };
        }

        if (user.id === req.session.userId) {
            return {
                code: 400,
                success: false,
                message: 'You can not delete this user',
                errors: [
                    { field: 'user', message: 'You can not delete this user' },
                ],
            };
        }

        await user.remove();

        return {
            code: 200,
            success: true,
            message: 'User deleted successfully',
        };
    }

    @Mutation(() => UserMutationResponse)
    @UseMiddleware(checkAuth, checkAdmin)
    async changeStatusUser(
        @Arg('userId') userId: string,
        @Arg('status') status: string,
    ): Promise<UserMutationResponse> {
        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return {
                code: 400,
                success: false,
                message: 'User no longer exists',
                errors: [{ field: 'user', message: 'User no longer exists' }],
            };
        }

        user.status = status;

        return {
            code: 200,
            success: true,
            message: 'User status successfully',
            user: await user.save(),
        };
    }

    @Mutation(() => UserMutationResponse)
    @UseMiddleware(checkAuth)
    async uploadAvatarProfile(
        @Arg('imageUrl') imageUrl: string,
        @Ctx() { req }: IMyContext,
    ): Promise<UserMutationResponse> {
        const user = await User.findOne({ where: { id: req.session.userId } });

        if (!user) {
            return {
                code: 400,
                success: false,
                message: 'User no longer exists',
                errors: [{ field: 'user', message: 'User no longer exists' }],
            };
        }

        user.avatar = imageUrl;

        return {
            code: 200,
            success: true,
            message: 'Updated user avatar successfully',
            user: await user.save(),
        };
    }
}
