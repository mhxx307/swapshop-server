import { Field, ObjectType } from 'type-graphql';
import { Review } from '../../entities';
import IMutationResponse, { FieldError } from './MutationResponse';

@ObjectType({ implements: IMutationResponse })
export default class CategoryMutationResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field({ nullable: true })
    review?: Review;

    @Field((type) => [FieldError], { nullable: true })
    errors?: FieldError[];
}
