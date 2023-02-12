import { Field, InputType } from 'type-graphql';

@InputType()
export default class CreatedCommentInput {
    @Field()
    content: string;

    @Field()
    status?: string;
}
