import { Field, ObjectType } from 'type-graphql';
import IMutationResponse, { FieldError } from './MutationResponse';
import { Article } from '../../entities';

@ObjectType({ implements: IMutationResponse })
export default class ArticleMutationResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field({ nullable: true })
    article?: Article;

    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
}
