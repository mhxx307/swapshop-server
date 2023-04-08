import DataLoader from 'dataloader';
import { Role, UserRole } from '../entities';

export const findRoles = async (
    userId: string,
    roleLoader: DataLoader<string, Role | undefined, string>,
) => {
    // find roles of user from database
    // const roles = await Role.find({
    //     relations: ['users'],
    //     where: {
    //         users: {
    //             userId: userId,
    //         },
    //     },
    // });

    const userRoles = await UserRole.find({
        where: {
            userId: userId,
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

    return roles;
};
