import {
    Arg,
    Ctx,
    FieldResolver,
    Int,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { FindManyOptions, LessThan } from 'typeorm';

import { ArticleMutationResponse } from '../types/response';
import {
    DeleteArticleInput,
    InsertArticleInput,
    UpdateArticleInput,
} from '../types/input';
import { Article, Category, User } from '../entities';
import { IMyContext } from '../types';
import { checkAuth } from '../middleware';
import { hasMorePaginated, showError } from '../utils';
import { PaginatedArticles } from '../types/paginated.type';

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
                discount,
                price,
                productName,
                images,
                categoryIds,
            } = insertArticleInput;

            const newArticle = Article.create({
                title,
                description,
                discount,
                price,
                productName,
                thumbnail: images[0],
                userId: req.session.userId,
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

    @Query(() => PaginatedArticles, { nullable: true })
    async articles(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', { nullable: true }) cursor?: string,
    ): Promise<PaginatedArticles | null> {
        try {
            const realLimit = Math.min(20, limit);

            const findOptions:
                | FindManyOptions<Article>
                | { [key: string]: unknown } = {
                order: {
                    createdDate: 'DESC',
                },
                take: realLimit,
            };

            let lastArticle: Article[] = [];

            if (cursor) {
                findOptions.where = { createdDate: LessThan(cursor) };
                lastArticle = await Article.find({
                    order: { createdDate: 'ASC' },
                    take: 1,
                });
            }

            const [articles, totalCount] = await Article.findAndCount(
                findOptions,
            );

            return {
                totalCount,
                cursor: articles[articles.length - 1].createdDate,
                hasMore: hasMorePaginated({
                    cursor,
                    currentDataList: articles,
                    lastItem: lastArticle[0],
                    totalCount,
                }),
                paginatedArticles: articles,
            };
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
            } else {
                console.log('Unexpected error', error);
            }
            return null;
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
    @UseMiddleware(checkAuth)
    async updateArticle(
        @Arg('updateArticleInput') updateArticleInput: UpdateArticleInput,
        @Ctx() { req }: IMyContext,
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

            if (existingArticle.userId !== req.session.userId) {
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
}
