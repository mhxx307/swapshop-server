import DataLoader from 'dataloader';
import { Review, Role, UserRole } from '../entities';

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

export async function calculateUserRating(userId: string): Promise<number> {
    const reviews = await Review.find({ where: { userId } });
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    const roundedRating = Math.round(averageRating * 2) / 2;
    return roundedRating;
}
