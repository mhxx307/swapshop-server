import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import {
    Between,
    FindManyOptions,
    In,
    LessThanOrEqual,
    Like,
    MoreThanOrEqual,
} from 'typeorm';

import { ArticleMutationResponse } from '../types/response';
import {
    DeleteArticleInput,
    InsertArticleInput,
    UpdateArticleInput,
} from '../types/input';
import { Article, Category, User } from '../entities';
import { IMyContext } from '../types/context';
import { checkAdmin, checkAuth } from '../middleware/session';
import { showError } from '../utils';
import {
    QueryConfig,
    ArticleResponseSuccess,
} from '../types/paginationArticle';
import { ORDER, SORT_BY } from '../constants/article';

@Resolver(() => Article)
export default class ArticleResolver {
    @FieldResolver(() => User)
    async user(
        @Root() root: Article,
        @Ctx() { dataLoaders: { userLoader } }: IMyContext,
    ) {
        return await userLoader.load(root.userId);
    }

    @FieldResolver(() => [Category])
    async categories(
        @Root() root: Article,
        @Ctx() { dataLoaders: { categoryLoader } }: IMyContext,
    ) {
        return root.categoryIds.map(
            async (id) => await categoryLoader.load(id),
        );
    }

    @Mutation(() => ArticleMutationResponse)
    @UseMiddleware(checkAuth)
    async insertArticle(
        @Arg('insertArticleInput') insertArticleInput: InsertArticleInput,
        @Ctx() { req }: IMyContext,
    ): Promise<ArticleMutationResponse> {
        try {
            const {
                title,
                description,
                price,
                productName,
                images,
                categoryIds,
                address,
            } = insertArticleInput;

            const newArticle = Article.create({
                title,
                description,
                price,
                productName,
                thumbnail: images[0],
                userId: req.session.userId,
                images,
                categoryIds,
                address,
            });

            return {
                code: 200,
                success: true,
                message: 'Article created successfully',
                article: await newArticle.save(),
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Query(() => ArticleResponseSuccess)
    async articles(
        @Arg('queryConfig') queryConfig: QueryConfig,
    ): Promise<ArticleResponseSuccess> {
        try {
            const {
                limit,
                categories,
                title,
                price_max,
                price_min,
                page = 1,
                userId,
                user_rating,
                status,
            } = queryConfig;

            let { order_by, sort_by } = queryConfig;

            const realLimit = Math.min(30, Number(limit) || 30);

            const findOptions: FindManyOptions<Article> = {
                take: realLimit,
                relations: ['user'], // add a join with the User entity
                where: {},
            };

            findOptions.where = {};

            // Add a condition to filter by the rating attribute in the User entity
            if (user_rating) {
                findOptions.where = {
                    'user.rating': Number(user_rating),
                };
            }

            if (categories && categories.length > 0) {
                const categoryIds = categories.map((category) => [category]);
                // findOptions.where = {
                //     categoryIds: In(categoryIds),
                // };
                findOptions.where.categoryIds = In(categoryIds);
            }

            if (title) {
                // findOptions.where = {
                //     title: Like(`%${title}%`),
                // };
                findOptions.where.title = Like(`%${title}%`);
            }

            // wrong in between, need add address
            if (Number(price_min) && Number(price_max)) {
                // findOptions.where = {
                //     price: Between(Number(price_min), Number(price_max)),
                // };
                findOptions.where.price = Between(
                    Number(price_min),
                    Number(price_max),
                );
            } else if (Number(price_min)) {
                // findOptions.where = {
                //     price: MoreThanOrEqual(Number(price_min)),
                // };
                findOptions.where.price = MoreThanOrEqual(Number(price_min));
            } else if (Number(price_max)) {
                // findOptions.where = {
                //     price: LessThanOrEqual(Number(price_max)),
                // };
                findOptions.where.price = LessThanOrEqual(Number(price_max));
            }

            if (status) {
                // findOptions.where = {
                //     status,
                // };
                findOptions.where.status = status;
            }

            if (userId) {
                // findOptions.where = {
                //     userId,
                // };
                findOptions.where.userId = userId;
            }

            if (!ORDER.includes(order_by as string)) {
                order_by = ORDER[0];
            }

            if (!SORT_BY.includes(sort_by as string)) {
                sort_by = SORT_BY[0];
            }

            findOptions.order = {
                [sort_by as string]: order_by,
            };

            findOptions.skip = Number(page) * realLimit - realLimit;

            findOptions.take = realLimit;

            const [articles, totalCount] = await Article.findAndCount(
                findOptions,
            );

            const page_size = Math.ceil(totalCount / realLimit) || 1;

            return {
                message: 'Lấy các articles thành công',
                data: {
                    articles,
                    pagination: {
                        page,
                        limit: realLimit,
                        page_size,
                    },
                },
            };
        } catch (error) {
            return {
                message: 'Something went wrong',
            };
        }
    }

    @Query(() => Article, { nullable: true })
    async article(
        @Arg('articleId') articleId: string,
    ): Promise<Article | null | undefined> {
        try {
            const article = await Article.findOne({
                where: {
                    id: articleId,
                },
            });
            if (!article) {
                return null;
            }
            article.views += 1;
            await article.save();
            return article;
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
            } else {
                console.log('Unexpected error', error);
            }
            return null;
        }
    }

    @Mutation(() => ArticleMutationResponse)
    @UseMiddleware(checkAuth)
    async updateArticle(
        @Arg('updateArticleInput') updateArticleInput: UpdateArticleInput,
        @Ctx() { req }: IMyContext,
    ): Promise<ArticleMutationResponse> {
        try {
            const {
                id,
                description,
                title,
                categoryIds,
                images,
                price,
                productName,
                status,
            } = updateArticleInput;

            const existingArticle = await Article.findOne({
                where: {
                    id,
                },
            });

            if (!existingArticle)
                return {
                    code: 400,
                    success: false,
                    message: 'Article not found',
                };

            if (existingArticle.userId !== req.session.userId) {
                return {
                    code: 401,
                    success: false,
                    message: 'Unauthorized',
                };
            }

            existingArticle.title = title;
            existingArticle.images = images;
            existingArticle.price = price;
            existingArticle.productName = productName;
            existingArticle.categoryIds = categoryIds;
            existingArticle.description = description;
            existingArticle.status = status;

            return {
                code: 200,
                success: true,
                message: 'Article updated successfully',
                article: await existingArticle.save(),
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Mutation(() => ArticleMutationResponse)
    @UseMiddleware(checkAuth)
    async deleteArticle(
        @Arg('deleteArticleInput') deleteArticleInput: DeleteArticleInput,
        @Ctx() { req }: IMyContext,
    ): Promise<ArticleMutationResponse> {
        try {
            const { id } = deleteArticleInput;

            const existingArticle = await Article.findOne({
                where: {
                    id,
                },
            });

            if (!existingArticle)
                return {
                    code: 400,
                    success: false,
                    message: 'Article not found',
                };

            if (existingArticle.userId !== req.session.userId) {
                return {
                    code: 401,
                    success: false,
                    message: 'Unauthorized',
                };
            }

            await Article.delete(id);

            return {
                code: 200,
                success: true,
                message: 'Delete successfully',
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Mutation(() => ArticleMutationResponse)
    @UseMiddleware(checkAuth, checkAdmin)
    async changeStatusArticle(
        @Arg('articleId') articleId: string,
        @Arg('status') status: string,
    ): Promise<ArticleMutationResponse> {
        const article = await Article.findOne({ where: { id: articleId } });

        if (!article) {
            return {
                code: 400,
                success: false,
                message: 'article no longer exists',
            };
        }

        article.status = status;

        return {
            code: 200,
            success: true,
            message: 'User status successfully',
            article: await article.save(),
        };
    }
}
