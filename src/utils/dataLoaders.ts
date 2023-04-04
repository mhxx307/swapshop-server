import { In } from 'typeorm';
import { User, Article, Category, Role } from '../entities';
import DataLoader from 'dataloader';

const batchGetUsers = async (userIds: string[]) => {
    const users = await User.findByIds(userIds);
    return userIds.map((userId) => users.find((user) => user.id === userId));
};

const batchGetArticles = async (articleIds: string[]) => {
    const articles = await Article.findByIds(articleIds);
    return articleIds.map((articleId) =>
        articles.find((article) => article.id === articleId),
    );
};

const batchGetCategories = async (categoryIds: string[]) => {
    const categories = await Category.findByIds(categoryIds);
    return categoryIds.map((categoryId) =>
        categories.find((category) => category.id === categoryId),
    );
};

const batchGetRoles = async (roleIds: string[]) => {
    const roles = await Role.findByIds(roleIds);
    return roleIds.map((roleId) => roles.find((role) => role.id === roleId));
};

export const buildDataLoaders = () => ({
    userLoader: new DataLoader<string, User | undefined>((userIds) =>
        batchGetUsers(userIds as string[]),
    ),
    articleLoader: new DataLoader<string, Article | undefined>((articleIds) =>
        batchGetArticles(articleIds as string[]),
    ),
    categoryLoader: new DataLoader<string, Category | undefined>(
        (categoryIds) => batchGetCategories(categoryIds as string[]),
    ),
    roleLoader: new DataLoader<string, Role | undefined>((roleIds) =>
        batchGetRoles(roleIds as string[]),
    ),
});
