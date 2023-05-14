import { Field, InputType } from 'type-graphql';

@InputType()
export default class InsertMessageInput {
    @Field()
    conversationId: string;

    @Field({ nullable: true })
    text: string;

    @Field()
    senderId: string;

    @Field(() => [String], { nullable: true })
    images: string[];
}
