import { Role } from '../entities';
import { Arg, Mutation, Query } from 'type-graphql';

import { showError } from '../utils';
import { RoleMutationResponse } from '../types/response';

export default class RoleResolver {
    @Mutation(() => RoleMutationResponse)
    async insertRole(@Arg('name') name: string): Promise<RoleMutationResponse> {
        try {
            const existRole = await Role.findOne({ where: { name } });

            if (existRole) {
                return {
                    code: 400,
                    success: false,
                    message: 'Role already exists',
                };
            }

            const newRole = Role.create({
                name,
            });

            return {
                code: 200,
                success: true,
                message: 'Role created successfully',
                role: await newRole.save(),
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Query(() => [Role], { nullable: true })
    async roles(): Promise<Role[] | null> {
        return await Role.find();
    }
}
