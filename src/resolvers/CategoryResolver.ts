import { Arg, Mutation, Query } from 'type-graphql';

import { Category } from '../entities';
import { CategoryMutationResponse } from '../types/response';
import { showError } from '../utils';

export default class CategoryResolver {
    @Mutation(() => CategoryMutationResponse)
    async insertCategory(
        @Arg('name') name: string,
        @Arg('image') image: string,
    ): Promise<CategoryMutationResponse> {
        try {
            const existCategory = await Category.findOne({ where: { name } });

            if (existCategory) {
                return {
                    code: 400,
                    success: false,
                    message: 'Category already exists',
                };
            }

            const newCategory = Category.create({
                name,
                image,
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

    @Query(() => [Category], { nullable: true })
    async categories(): Promise<Category[] | null> {
        return await Category.find();
    }
}
