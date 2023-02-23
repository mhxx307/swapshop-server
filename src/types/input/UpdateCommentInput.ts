import { Field, InputType } from 'type-graphql';

@InputType()
export default class UpdateCommentInput {
    @Field()
    text: string;

    @Field()
    status: string;
}
