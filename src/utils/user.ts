import { Role, User } from '../entities';

export const findRoles = async (user: User) => {
    // find roles of user from database
    const roles = await Role.find({
        relations: ['users'],
        where: {
            users: {
                userId: user.id,
            },
        },
    });

    const rolesAuth = roles.map((role) => ({
        id: role.id,
        name: role.name,
    }));

    return rolesAuth;
};
