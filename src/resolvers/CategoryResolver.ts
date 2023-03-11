import { Arg, Mutation } from 'type-graphql';

import { Category } from '../entities';
import { CategoryMutationResponse } from '../types/response';
import { showError } from '../utils';

export default class CategoryResolver {
    @Mutation(() => CategoryMutationResponse)
    async insertCategory(
        @Arg('name') name: string,
    ): Promise<CategoryMutationResponse> {
        try {
            const newCategory = Category.create({
                name,
            });

            return {
                code: 200,
                success: true,
                message: 'Category created successfully',
                category: await newCategory.save(),
            };
        } catch (error) {
            return showError(error);
        }
    }
}
