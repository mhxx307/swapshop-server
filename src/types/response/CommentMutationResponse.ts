import { Field, ObjectType } from 'type-graphql';
import IMutationResponse, { FieldError } from './MutationResponse';
import { Comment } from '../../entities';

@ObjectType({ implements: IMutationResponse })
export default class CommentMutationResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field({ nullable: true })
    comment?: Comment;

    @Field((type) => [FieldError], { nullable: true })
    errors?: FieldError[];
}
