import { Field, ObjectType } from 'type-graphql';
import IMutationResponse, { FieldError } from './mutation-response';
import { Conversation } from '../../entities';

@ObjectType({ implements: IMutationResponse })
export default class ConversationMutationResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field({ nullable: true })
    conversation?: Conversation;

    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
}
