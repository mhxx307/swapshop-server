import { Field, ObjectType } from 'type-graphql';
import IMutationResponse, { FieldError } from './mutation-response';
import { Message } from '../../entities';

@ObjectType({ implements: IMutationResponse })
export default class MessageMutationResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field({ nullable: true })
    createdMessage?: Message;

    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
}
