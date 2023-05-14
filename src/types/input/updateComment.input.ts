import { Field, InputType } from 'type-graphql';

@InputType()
export default class UpdateCommentInput {
    @Field()
    id: string;

    @Field()
    text: string;
}
