import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Resolver,
    Root,
    UseMiddleware,
    Query,
    Int,
} from 'type-graphql';
import { FindManyOptions, LessThan } from 'typeorm';

import { Article, Comment, User } from '../entities';
import { checkAuth } from '../middleware/session';
import { IMyContext } from '../types/context';
import { InsertCommentInput, UpdateCommentInput } from '../types/input';
import { PaginatedComments } from '../types/pagination';
import { CommentMutationResponse } from '../types/response';
import { hasMorePaginated, showError } from '../utils';

@Resolver(() => Comment)
export default class CommentResolver {
    @FieldResolver(() => User)
    async user(
        @Root() root: Comment,
        @Ctx() { dataLoaders: { userLoader } }: IMyContext,
    ) {
        return await userLoader.load(root.userId);
    }

    @FieldResolver(() => Article)
    async article(
        @Root() root: Comment,
        @Ctx() { dataLoaders: { articleLoader } }: IMyContext,
    ) {
        return await articleLoader.load(root.articleId);
    }

    @Mutation(() => CommentMutationResponse)
    @UseMiddleware(checkAuth)
    async insertComment(
        @Arg('insertCommentInput') insertCommentInput: InsertCommentInput,
        @Ctx() { req }: IMyContext,
    ): Promise<CommentMutationResponse> {
        try {
            const { text, articleId } = insertCommentInput;

            const newComment = Comment.create({
                userId: req.session.userId,
                text,
                articleId,
            });

            return {
                code: 200,
                success: true,
                message: 'Comment created successfully',
                comment: await newComment.save(),
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Query(() => PaginatedComments, { nullable: true })
    async commentListByArticleId(
        @Arg('articleId') articleId: string,
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', { nullable: true }) cursor?: string,
    ): Promise<PaginatedComments | null> {
        const realLimit = Math.min(20, limit);
        try {
            const findOptions:
                | FindManyOptions<Comment>
                | { [key: string]: unknown } = {
                order: {
                    createdDate: 'DESC',
                },
                take: realLimit,
                where: { articleId },
            };

            let lastComment: Comment[] = [];

            if (cursor) {
                findOptions.where = {
                    createdDate: LessThan(cursor),
                };
                lastComment = await Comment.find({
                    order: { createdDate: 'ASC' },
                    take: 1,
                    where: { articleId },
                });
            }

            const [comments, totalCount] = await Comment.findAndCount(
                findOptions,
            );

            return {
                totalCount: totalCount,
                cursor: comments[comments.length - 1].createdDate,
                hasMore: hasMorePaginated({
                    cursor,
                    currentDataList: comments,
                    lastItem: lastComment[0],
                    totalCount,
                }),
                paginatedComments: comments,
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

    @Mutation(() => CommentMutationResponse)
    @UseMiddleware(checkAuth)
    async deleteComment(
        @Arg('id') id: string,
        @Ctx() { req }: IMyContext,
    ): Promise<CommentMutationResponse> {
        try {
            console.log('id', id);
            const existingComment = await Comment.findOne({
                where: {
                    id,
                },
            });
            console.log('existComment', existingComment);

            if (!existingComment)
                return {
                    code: 400,
                    success: false,
                    message: 'Comment not found',
                };

            if (existingComment.userId !== req.session.userId) {
                return {
                    code: 401,
                    success: false,
                    message: 'Unauthorized',
                };
            }

            await Comment.delete(id);

            return {
                code: 200,
                success: true,
                message: 'Delete successfully',
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Mutation(() => CommentMutationResponse)
    @UseMiddleware(checkAuth)
    async updateComment(
        @Arg('updateCommentInput') updateCommentInput: UpdateCommentInput,
        @Ctx() { req }: IMyContext,
    ): Promise<CommentMutationResponse> {
        try {
            const { id, text } = updateCommentInput;

            const existingComment = await Comment.findOne({
                where: {
                    id,
                },
            });

            if (!existingComment)
                return {
                    code: 400,
                    success: false,
                    message: 'Comment not found',
                };

            if (existingComment.userId !== req.session.userId) {
                return {
                    code: 401,
                    success: false,
                    message: 'Unauthorized',
                };
            }

            existingComment.text = text;
            existingComment.status = 'Updated';

            return {
                code: 200,
                success: true,
                message: 'Delete successfully',
                comment: await existingComment.save(),
            };
        } catch (error) {
            return showError(error);
        }
    }
}
