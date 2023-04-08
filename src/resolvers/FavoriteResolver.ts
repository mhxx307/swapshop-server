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

import { FavoriteMutationResponse } from '../types/response';
import { Article, Comment, User, Favorite } from '../entities';
import { checkAuth } from '../middleware/session';
import { IMyContext } from '../types/context';
import { showError } from '../utils';
import { In } from 'typeorm';

@Resolver(() => Comment)
export default class CommentResolver {
    @FieldResolver(() => User)
    async user(
        @Root() root: Favorite,
        @Ctx() { dataLoaders: { userLoader } }: IMyContext,
    ) {
        return await userLoader.load(root.userId);
    }

    @FieldResolver(() => Article)
    async article(
        @Root() root: Favorite,
        @Ctx() { dataLoaders: { articleLoader } }: IMyContext,
    ) {
        return await articleLoader.load(root.articleId);
    }

    @Mutation(() => FavoriteMutationResponse)
    @UseMiddleware(checkAuth)
    async addToFavorite(
        @Arg('articleId') articleId: string,
        @Ctx() { req }: IMyContext,
    ): Promise<FavoriteMutationResponse> {
        try {
            const existingFavorite = await Favorite.findOne({
                where: { articleId, userId: req.session.userId },
            });

            const existingArticle = await Article.findOne({
                where: { id: articleId },
            });

            if (!existingArticle) {
                return {
                    code: 400,
                    success: false,
                    message: 'Article not found',
                };
            }

            existingArticle.favoritesCount = existingArticle.favoritesCount + 1;
            await existingArticle.save();

            if (existingFavorite) {
                return {
                    code: 400,
                    success: false,
                    message: 'Favorite already exists',
                };
            }

            const newFavorite = Favorite.create({
                articleId,
                userId: req.session.userId,
            });

            return {
                code: 200,
                success: true,
                message: 'Favorite created successfully',
                favorite: await newFavorite.save(),
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Mutation(() => FavoriteMutationResponse)
    @UseMiddleware(checkAuth)
    async removeFromFavorite(
        @Arg('articleIds', () => [String]) articleIds: string[],
        @Ctx() { req }: IMyContext,
    ): Promise<FavoriteMutationResponse> {
        try {
            await Favorite.delete({
                articleId: In(articleIds),
                userId: req.session.userId,
            });

            return {
                code: 200,
                success: true,
                message: 'Favorite removed successfully',
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Query(() => [Favorite], { nullable: true })
    @UseMiddleware(checkAuth)
    async favorites(@Ctx() { req }: IMyContext): Promise<Favorite[] | null> {
        try {
            const favorites = await Favorite.find({
                where: { userId: req.session.userId },
                relations: ['article'],
            });

            return favorites;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    @Query(() => Boolean)
    @UseMiddleware(checkAuth)
    async isFavorite(
        @Arg('articleId') articleId: string,
        @Ctx() { req }: IMyContext,
    ): Promise<boolean> {
        try {
            const favorite = await Favorite.findOne({
                where: { articleId, userId: req.session.userId },
            });

            return !!favorite;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    @Query(() => Number, { nullable: true })
    async countFavoritesForArticle(
        @Arg('articleId') articleId: string,
    ): Promise<number | null> {
        try {
            const count = await Favorite.count({
                where: { articleId },
            });

            return count;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}
