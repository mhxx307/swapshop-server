import {
    Arg,
    Ctx,
    ID,
    Mutation,
    Query,
    Resolver,
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
import { IMyContext } from '../types';
import { checkAuth, checkArticleBelongTo } from '../middleware';
import showError from '../utils';

@Resolver()
export default class ArticleResolver {
    @Mutation(() => ArticleMutationResponse)
    @UseMiddleware(checkAuth)
    async createArticle(
        @Arg('createArticleInput') input: CreateArticleInput,
        @Ctx() { req }: IMyContext
    ): Promise<ArticleMutationResponse> {
        const userId = req.session.userId;

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
            return showError(error);
        }
    }

    @Query(() => [Article], { nullable: true })
    async articles(): Promise<Article[] | null> {
        try {
            return await Article.find();
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
    @UseMiddleware(checkAuth, checkArticleBelongTo)
    async updateArticle(
        @Arg('updateArticleInput') updateArticleInput: UpdateArticleInput
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
    @UseMiddleware(checkAuth, checkArticleBelongTo)
    async deleteArticle(
        @Arg('deleteArticleInput') deleteArticleInput: DeleteArticleInput
    ): Promise<ArticleMutationResponse> {
        try {
            const { id } = deleteArticleInput;
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
