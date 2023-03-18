import { UserMutationResponse } from '../types/response';
import {
    Arg,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
} from 'type-graphql';

import { Role, User, UserRole } from '../entities';
import { showError } from '../utils';

@Resolver(() => UserRole)
export default class UserRoleResolver {
    @FieldResolver((_return) => User)
    user(@Root() root: UserRole) {
        return User.findOne({
            where: { id: root.userId },
        });
    }

    @FieldResolver((_return) => Role)
    role(@Root() root: UserRole) {
        return Role.findOne({
            where: { id: root.roleId },
        });
    }

    @Mutation(() => UserMutationResponse)
    async insertUserRole(
        @Arg('userId') userId: string,
        @Arg('roleId') roleId: string,
    ): Promise<UserMutationResponse> {
        try {
            await UserRole.create({
                userId,
                roleId,
            }).save();

            const user = await User.findOne({
                where: { id: userId },
                relations: ['roles'],
            });

            return {
                code: 200,
                success: true,
                message: 'UserRole created successfully',
                user: user as User,
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Query(() => [UserRole])
    async getUserRoles(): Promise<UserRole[]> {
        const userRoles = await UserRole.find();
        return userRoles;
    }
}
