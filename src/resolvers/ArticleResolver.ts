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
import { IMyContext } from '../types';
import { showError } from '../utils';
import { QueryConfig, ResponseSuccess } from '../types/pagination.type';
import { ORDER, SORT_BY } from '../constants/product';
import { verifyToken } from '../middleware/jwt';

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
    @UseMiddleware(verifyToken)
    async insertArticle(
        @Arg('insertArticleInput') insertArticleInput: InsertArticleInput,
        @Ctx() { user: { userId } }: IMyContext,
    ): Promise<ArticleMutationResponse> {
        try {
            const {
                title,
                description,
                price,
                productName,
                images,
                categoryIds,
            } = insertArticleInput;

            const newArticle = Article.create({
                title,
                description,
                price,
                productName,
                thumbnail: images[0],
                userId: userId,
                images,
                categoryIds,
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

    @Query(() => ResponseSuccess)
    async articles(
        @Arg('queryConfig') queryConfig: QueryConfig,
    ): Promise<ResponseSuccess> {
        try {
            const {
                limit,
                categories,
                isFree,
                title,
                price_max,
                price_min,
                page = 1,
            } = queryConfig;

            let { order_by, sort_by } = queryConfig;

            const realLimit = Math.min(30, Number(limit) || 30);

            const findOptions:
                | FindManyOptions<Article>
                | { [key: string]: unknown } = {
                take: realLimit,
            };

            if (categories && categories.length > 0) {
                const categoryIds = categories.map((category) => [category]);
                findOptions.where = {
                    categoryIds: In(categoryIds),
                };
            }

            if (title) {
                findOptions.where = {
                    title: Like(`%${title}%`),
                };
            }

            if (isFree) {
                findOptions.where = {
                    price: null,
                };
            }

            if (Number(price_min) && Number(price_max)) {
                findOptions.where = {
                    price: {
                        between: [Number(price_min), Number(price_max)],
                    },
                };
            } else if (Number(price_min)) {
                findOptions.where = {
                    price: MoreThanOrEqual(Number(price_min)),
                };
            } else if (Number(price_max)) {
                findOptions.where = {
                    price: LessThanOrEqual(Number(price_max)),
                };
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
    async article(@Arg('id') id: string): Promise<Article | null> {
        try {
            const article = await Article.findOne({
                where: {
                    id,
                },
            });
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
    @UseMiddleware(verifyToken)
    async updateArticle(
        @Arg('updateArticleInput') updateArticleInput: UpdateArticleInput,
        @Ctx() { user: { userId } }: IMyContext,
    ): Promise<ArticleMutationResponse> {
        try {
            const { id, description, title } = updateArticleInput;

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

            if (existingArticle.userId !== userId) {
                return {
                    code: 401,
                    success: false,
                    message: 'Unauthorized',
                };
            }

            existingArticle.description = description;
            existingArticle.title = title;

            return {
                code: 200,
                success: false,
                message: 'Article updated successfully',
                article: await existingArticle.save(),
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Mutation(() => ArticleMutationResponse)
    @UseMiddleware(verifyToken)
    async deleteArticle(
        @Arg('deleteArticleInput') deleteArticleInput: DeleteArticleInput,
        @Ctx() { user: { userId } }: IMyContext,
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

            if (existingArticle.userId !== userId) {
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
}
