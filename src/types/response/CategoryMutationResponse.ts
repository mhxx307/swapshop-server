import { Field, ObjectType } from 'type-graphql';
import IMutationResponse, { FieldError } from './MutationResponse';
import { Category } from '../../entities';

@ObjectType({ implements: IMutationResponse })
export default class CategoryMutationResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field({ nullable: true })
    category?: Category;

    @Field((type) => [FieldError], { nullable: true })
    errors?: FieldError[];
}
