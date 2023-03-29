import { Arg, Mutation, Query } from 'type-graphql';

import { UpdateCategoryInput } from '../types/input';
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

    @Mutation(() => CategoryMutationResponse)
    async updateCategory(
        @Arg('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
    ): Promise<CategoryMutationResponse> {
        try {
            const { id, name, image } = updateCategoryInput;

            const existingCategory = await Category.findOne({
                where: {
                    id,
                },
            });

            if (!existingCategory)
                return {
                    code: 400,
                    success: false,
                    message: 'Category not found',
                };

            existingCategory.name = name;
            existingCategory.image = image;

            return {
                code: 200,
                success: true,
                message: 'Update successfully',
                category: await existingCategory.save(),
            };
        } catch (error) {
            return showError(error);
        }
    }
}
