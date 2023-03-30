import { Role } from '../entities';

export const findRoles = async (userId: string) => {
    // find roles of user from database
    const roles = await Role.find({
        relations: ['users'],
        where: {
            users: {
                userId: userId,
            },
        },
    });

    return roles;
};