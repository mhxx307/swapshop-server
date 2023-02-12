import { Arg, Mutation, Resolver } from 'type-graphql';

import { CreatedCategoryInput } from '../types/input';
import CategoryMutationResponse from '../types/response/CategoryMutationResponse';

@Resolver()
export default class CategoryResolver {
    @Mutation(() => CategoryMutationResponse)
    async addCategory(
        @Arg('createdCategory') createdCategory: CreatedCategoryInput
    ): Promise<CategoryMutationResponse> {
        return { code: 200, success: false };
    }
}
