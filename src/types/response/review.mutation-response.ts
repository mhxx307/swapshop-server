import { Field, ObjectType } from 'type-graphql';
import { Review } from '../../entities';
import IMutationResponse, { FieldError } from './mutation-response';

@ObjectType({ implements: IMutationResponse })
export default class ReviewMutationResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field({ nullable: true })
    review?: Review;

    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
}
