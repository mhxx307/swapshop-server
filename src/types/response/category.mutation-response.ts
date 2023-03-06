import { Field, ObjectType } from 'type-graphql';
import IMutationResponse, { FieldError } from './mutation-response';
import { Category } from '../../entities';

@ObjectType({ implements: IMutationResponse })
export default class CategoryMutationResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field({ nullable: true })
    category?: Category;

    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
}
