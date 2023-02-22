import { In } from 'typeorm';
import { User } from '../entities';
import DataLoader from 'dataloader';

const batchGetUsers = async (userIds: string[]) => {
    const users = await User.findBy({ id: In(userIds) });
    return userIds.map((userId) => users.find((user) => user.id === userId));
};

export const buildDataLoaders = () => ({
    userLoader: new DataLoader<string, User | undefined>((userIds) =>
        batchGetUsers(userIds as string[])
    ),
});
