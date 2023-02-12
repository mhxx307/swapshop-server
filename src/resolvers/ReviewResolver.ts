import { Arg, Mutation, Resolver } from 'type-graphql';

import { CreatedReviewInput } from '../types/input';
import { ReviewMutationResponse } from '../types/response';

@Resolver()
export default class ReviewResolver {
    @Mutation(() => ReviewMutationResponse)
    async addReview(
        @Arg('createdReview') createdReview: CreatedReviewInput
    ): Promise<ReviewMutationResponse> {
        return { code: 200, success: false };
    }
}
