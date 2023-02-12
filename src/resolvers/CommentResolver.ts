import { Arg, Mutation, Resolver } from 'type-graphql';

import { CreatedComment } from '../types/input';
import { CommentMutationResponse } from '../types/response';

@Resolver()
export default class CommentResolver {
    @Mutation(() => CommentMutationResponse)
    async register(
        @Arg('createdComment') createdComment: CreatedComment
    ): Promise<CommentMutationResponse> {
        return { code: 200, success: false };
    }
}
