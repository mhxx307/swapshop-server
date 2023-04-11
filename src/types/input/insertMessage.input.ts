import { Field, InputType } from 'type-graphql';

@InputType()
export default class InsertMessageInput {
    @Field()
    conversationId: string;

    @Field()
    text: string;

    @Field()
    senderId: string;

    @Field(() => [String])
    images!: string[];
}
