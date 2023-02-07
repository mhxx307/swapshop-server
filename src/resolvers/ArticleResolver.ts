import { Arg, Ctx, ID, Mutation, Query, Resolver } from 'type-graphql';
import { ArticleMutationResponse } from '../types/response';
import { CreateArticleInput, UpdateArticleInput } from '../types/input';
import { Article, User } from '../entities';
import { IMyContext } from '../types';
import { GraphQLError } from 'graphql';

@Resolver()
export default class ArticleResolver {
    @Mutation(() => ArticleMutationResponse)
    async createArticle(
        @Arg('createArticleInput') input: CreateArticleInput,
        @Ctx() { req }: IMyContext
    ): Promise<ArticleMutationResponse> {
        const userId = req.session.userId;
        if (!userId)
            throw new GraphQLError(
                'Not authenticated to perform GraphQL operations'
            );

        try {
            const { title, description } = input;
            const user = await User.findOne({
                where: {
                    id: userId,
                },
            });

            if (user) {
                const newArticle = Article.create({
                    title,
                    description,
                    user,
                });

                return {
                    code: 200,
                    success: true,
                    message: 'Article created successfully',
                    article: await newArticle.save(),
                };
            }

            return {
                code: 400,
                success: false,
                message: 'User was wrong',
            };
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
                return {
                    code: 500,
                    success: false,
                    message: `Internal server error: ${error.message}`,
                };
            } else {
                console.log('Unexpected error', error);
                return {
                    code: 500,
                    success: false,
                    message: `Internal server error: ${error}`,
                };
            }
        }
    }

    @Query(() => [Article], { nullable: true })
    async findArticles(): Promise<Article[] | undefined> {
        try {
            return await Article.find();
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
            } else {
                console.log('Unexpected error', error);
            }
            return undefined;
        }
    }

    @Query(() => Article, { nullable: true })
    async findArticleById(
        @Arg('id', () => ID) id: string
    ): Promise<Article | null> {
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
    async updateArticle(
        @Arg('updateArticleInput') updateArticleInput: UpdateArticleInput,
        @Ctx() { req }: IMyContext
    ): Promise<ArticleMutationResponse> {
        const userId = req.session.userId;
        if (!userId)
            throw new GraphQLError(
                'Not authenticated to perform GraphQL operations'
            );

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

            // cần phải load dữ liệu từ FieldResolver
            // if (existingArticle.user.id !== userId) {
            //     return {
            //         code: 403,
            //         success: false,
            //         message:
            //             'You do not have the permission to update this article',
            //     };
            // }

            existingArticle.description = description;
            existingArticle.title = title;

            return {
                code: 200,
                success: false,
                message: 'Article updated successfully',
                article: await existingArticle.save(),
            };
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
                return {
                    code: 500,
                    success: false,
                    message: `Internal server error: ${error.message}`,
                };
            } else {
                console.log('Unexpected error', error);
                return {
                    code: 500,
                    success: false,
                    message: `Internal server error: ${error}`,
                };
            }
        }
    }

    @Mutation(() => ArticleMutationResponse)
    async deleteArticle(
        @Arg('id', () => ID) id: string,
        @Ctx() { req }: IMyContext
    ): Promise<ArticleMutationResponse> {
        const userId = req.session.userId;
        if (!userId)
            throw new GraphQLError(
                'Not authenticated to perform GraphQL operations'
            );

        try {
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

            // if (existingArticle.user.id !== userId) {
            //     return {
            //         code: 401,
            //         success: false,
            //         message:
            //             'You do not have the permission to update this article',
            //     };
            // }

            await Article.delete(id);

            return {
                code: 200,
                success: true,
                message: 'Delete successfully',
            };
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
                return {
                    code: 500,
                    success: false,
                    message: `Internal server error: ${error.message}`,
                };
            } else {
                console.log('Unexpected error', error);
                return {
                    code: 500,
                    success: false,
                    message: `Internal server error: ${error}`,
                };
            }
        }
    }
}
