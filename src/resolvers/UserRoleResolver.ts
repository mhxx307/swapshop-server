import { UserMutationResponse } from '../types/response';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
} from 'type-graphql';

import { Role, User, UserRole } from '../entities';
import { showError } from '../utils';
import { IMyContext } from '../types/context';

@Resolver(() => UserRole)
export default class UserRoleResolver {
    @FieldResolver((_return) => User)
    async user(
        @Root() root: UserRole,
        @Ctx() { dataLoaders: { userLoader } }: IMyContext,
    ) {
        return await userLoader.load(root.userId);
    }

    @FieldResolver((_return) => Role)
    async role(
        @Root() root: UserRole,
        @Ctx() { dataLoaders: { roleLoader } }: IMyContext,
    ) {
        return await roleLoader.load(root.roleId);
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
