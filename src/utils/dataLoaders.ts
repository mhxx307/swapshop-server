import { In } from 'typeorm';
import { User, Article } from '../entities';
import DataLoader from 'dataloader';

const batchGetUsers = async (userIds: string[]) => {
    const users = await User.findBy({ id: In(userIds) });
    return userIds.map((userId) => users.find((user) => user.id === userId));
};

const batchGetArticles = async (articleIds: string[]) => {
    const articles = await Article.findBy({ id: In(articleIds) });
    return articleIds.map((articleId) =>
        articles.find((article) => article.id === articleId)
    );
};

export const buildDataLoaders = () => ({
    userLoader: new DataLoader<string, User | undefined>((userIds) =>
        batchGetUsers(userIds as string[])
    ),
    articleLoader: new DataLoader<string, Article | undefined>((articleIds) =>
        batchGetArticles(articleIds as string[])
    ),
});
