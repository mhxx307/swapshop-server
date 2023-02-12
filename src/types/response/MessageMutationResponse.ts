import { Field, ObjectType } from 'type-graphql';
import IMutationResponse, { FieldError } from './MutationResponse';
import { Message } from '../../entities';

@ObjectType({ implements: IMutationResponse })
export default class MessageMutationResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field({ nullable: true })
    createdMessage?: Message;

    @Field((type) => [FieldError], { nullable: true })
    errors?: FieldError[];
}
