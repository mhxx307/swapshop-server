import { Arg, Mutation, Resolver } from 'type-graphql';

import { CreatedCategory, RegisterInput } from '../types/input';
import CategoryMutationResponse from '../types/response/CategoryMutationResponse';

@Resolver()
export default class CategoryResolver {
    @Mutation(() => CategoryMutationResponse)
    async register(
        @Arg('createdCategory') createdCategory: CreatedCategory
    ): Promise<CategoryMutationResponse> {
        return { code: 200, success: false };
    }
}
