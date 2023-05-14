import { Field, ObjectType } from 'type-graphql';
import IMutationResponse, { FieldError } from './mutation-response';
import { Comment } from '../../entities';

@ObjectType({ implements: IMutationResponse })
export default class CommentMutationResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field({ nullable: true })
    comment?: Comment;

    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
}
