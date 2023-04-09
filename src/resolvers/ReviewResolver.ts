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

import { Review, User } from '../entities';
import { checkAuth } from '../middleware/session';
import { IMyContext } from '../types/context';
import { ReviewUserInput } from '../types/input';
import { ReviewMutationResponse } from '../types/response';
import { showError } from '../utils';
import {
    ReviewOptions,
    ReviewResponseSuccess,
} from '../types/paginationReview';
import { FindManyOptions } from 'typeorm';
import { calculateUserRating } from '../utils/user';

@Resolver(() => Review)
export default class ReviewResolver {
    @FieldResolver(() => User)
    async user(
        @Root() root: Review,
        @Ctx() { dataLoaders: { userLoader } }: IMyContext,
    ) {
        return await userLoader.load(root.userId);
    }

    @FieldResolver(() => User)
    async assessor(
        @Root() root: Review,
        @Ctx() { dataLoaders: { userLoader } }: IMyContext,
    ) {
        return await userLoader.load(root.assessorId);
    }

    @Mutation(() => ReviewMutationResponse)
    @UseMiddleware(checkAuth)
    async reviewUser(
        @Arg('reviewUserInput') reviewUserInput: ReviewUserInput,
        @Ctx() { req }: IMyContext,
    ): Promise<ReviewMutationResponse> {
        try {
            const { content, rating, userId } = reviewUserInput;
            const realRating = Math.min(5, rating);
            const user = await User.findOneOrFail(userId);

            if (realRating < 0)
                return {
                    code: 400,
                    success: false,
                    message: 'Rating must be greater than 0',
                };

            if (userId === req.session.userId)
                return {
                    code: 400,
                    success: false,
                    message: 'You cannot review yourself',
                };

            const existingReview = await Review.findOne({
                where: {
                    userId,
                    assessorId: req.session.userId,
                },
            });

            if (existingReview) {
                existingReview.content = content;
                existingReview.rating = realRating;

                user.rating = await calculateUserRating(userId);
                await user.save();

                return {
                    code: 200,
                    success: true,
                    message: 'Review updated successfully',
                    review: await existingReview.save(),
                };
            }

            const newReview = Review.create({
                content,
                rating: realRating,
                userId,
                assessorId: req.session.userId,
            });

            user.rating = await calculateUserRating(userId);
            await user.save();

            return {
                code: 200,
                success: true,
                message: 'Review created successfully',
                review: await newReview.save(),
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Mutation(() => ReviewMutationResponse)
    @UseMiddleware(checkAuth)
    async deleteReview(
        @Arg('id') id: string,
        @Ctx() { req }: IMyContext,
    ): Promise<ReviewMutationResponse> {
        try {
            const existingReview = await Review.findOne({
                where: {
                    id,
                },
            });

            if (!existingReview)
                return {
                    code: 400,
                    success: false,
                    message: 'Review not found',
                };

            if (existingReview.assessorId !== req.session.userId) {
                return {
                    code: 401,
                    success: false,
                    message: 'Unauthorized',
                };
            }

            await Review.delete(id);

            return {
                code: 200,
                success: true,
                message: 'Delete successfully',
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Query(() => ReviewResponseSuccess)
    async reviews(
        @Arg('reviewOptions') reviewOptions: ReviewOptions,
    ): Promise<ReviewResponseSuccess> {
        try {
            const { limit, page = 1 } = reviewOptions;

            const realLimit = Math.min(30, Number(limit) || 30);

            const findOptions:
                | FindManyOptions<Review>
                | { [key: string]: unknown } = {
                take: realLimit,
            };

            findOptions.skip = Number(page) * realLimit - realLimit;

            findOptions.take = realLimit;

            const [reviews, totalCount] = await Review.findAndCount(
                findOptions,
            );

            const page_size = Math.ceil(totalCount / realLimit) || 1;

            return {
                message: 'Successfully',
                data: {
                    reviews,
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
}
