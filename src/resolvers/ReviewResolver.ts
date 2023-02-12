import { Arg, Mutation, Resolver } from 'type-graphql';

import { CreatedReview } from '../types/input';
import { ReviewMutationResponse } from '../types/response';

@Resolver()
export default class ReviewResolver {
    @Mutation(() => ReviewMutationResponse)
    async register(
        @Arg('createdReview') createdReview: CreatedReview
    ): Promise<ReviewMutationResponse> {
        return { code: 200, success: false };
    }
}
