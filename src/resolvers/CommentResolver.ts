import { Arg, Mutation, Resolver } from 'type-graphql';

import { CreatedCommentInput } from '../types/input';
import { CommentMutationResponse } from '../types/response';

@Resolver()
export default class CommentResolver {
    @Mutation(() => CommentMutationResponse)
    async addComment(
        @Arg('createdComment') createdComment: CreatedCommentInput
    ): Promise<CommentMutationResponse> {
        return { code: 200, success: false };
    }
}
