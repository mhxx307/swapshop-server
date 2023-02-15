import {
    Arg,
    Args,
    Ctx,
    FieldResolver,
    Int,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';

import { ArticleMutationResponse } from '../types/response';
import {
    CreateArticleInput,
    DeleteArticleInput,
    FindArticleInput,
    UpdateArticleInput,
} from '../types/input';
import { Article, User } from '../entities';
import { IMyContext, PaginatedArticles } from '../types';
import { checkAuth } from '../middleware';
import showError from '../utils';
import { FindManyOptions, LessThan } from 'typeorm';

@Resolver(() => Article)
export default class ArticleResolver {
    @FieldResolver(() => User)
    async user(@Root() root: Article) {
        return await User.findOne({ where: { id: root.userId } });
    }

    @Mutation(() => ArticleMutationResponse)
    @UseMiddleware(checkAuth)
    async createArticle(
        @Arg('createArticleInput') input: CreateArticleInput,
        @Ctx() { req }: IMyContext
    ): Promise<ArticleMutationResponse> {
        try {
            const { title, description } = input;

            const newArticle = Article.create({
                title,
                description,
                userId: req.session.userId,
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

    // @Query(() => PaginatedArticles, { nullable: true })
    // async articles(
    //     @Arg('limit', () => Int) limit: number,
    //     @Arg('cursor', { nullable: true }) cursor?: string
    // ): Promise<PaginatedArticles | null> {
    //     try {
    //         const realLimit = Math.min(50, limit);

    //         const findOptions:
    //             | FindManyOptions<Article>
    //             | { [key: string]: any } = {
    //             order: {
    //                 createdDate: 'DESC',
    //             },
    //             take: realLimit,
    //             where: cursor ? { createdDate: LessThan(cursor) } : undefined,
    //             // skip: cursor && realLimit,
    //         };

    //         let lastArticle: Article[] = [];

    //         if (cursor) {
    //             lastArticle = await Article.find({
    //                 order: { createdDate: 'ASC' },
    //                 take: 1,
    //             });
    //         }

    //         const [articles, totalCount] = await Article.findAndCount(
    //             findOptions
    //         );

    //         return {
    //             totalCount: totalCount,
    //             cursor: articles[articles.length - 1].createdDate,
    //             hasMore: cursor
    //                 ? articles[articles.length - 1].createdDate.toString() !==
    //                   lastArticle[0].createdDate.toString()
    //                 : articles.length !== totalCount,
    //             paginatedArticles: articles.slice(0, realLimit),
    //         };
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             console.log(error.message);
    //         } else {
    //             console.log('Unexpected error', error);
    //         }
    //         return null;
    //     }
    // }

    @Query(() => PaginatedArticles, { nullable: true })
    async articles(
        @Arg('first', () => Int, { nullable: true })
        first: number = 10,
        @Arg('after', () => String, { nullable: true })
        after?: string
    ): Promise<PaginatedArticles> {
        const [articles, totalCount] = await Article.createQueryBuilder(
            'articles'
        )
            .orderBy('articles.createdDate', 'DESC')
            .skip(after ? parseInt(Buffer.from(after, 'base64').toString()) : 0)
            .take(first)
            .getManyAndCount();

        // const hasMore =
        //     totalCount > (parseInt(after!, 10) || 0) + articles.length;

        const hasMore = articles.length === first;

        const endCursor = Buffer.from(
            `${parseInt(after!, 10) || 0 + articles.length}`
        ).toString('base64');

        console.log(hasMore);

        return {
            articles,
            endCursor,
            hasMore,
            totalCount,
        };
    }

    @Query(() => Article, { nullable: true })
    async article(
        @Arg('findArticleInput') findArticleInput: FindArticleInput
    ): Promise<Article | null> {
        const { id } = findArticleInput;
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
        @Ctx() { req }: IMyContext
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

            if (existingArticle.user.id !== req.session.userId) {
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
        @Ctx() { req }: IMyContext
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

            if (existingArticle.user.id !== req.session.userId) {
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
