import { Field, InputType } from 'type-graphql';

@InputType()
export default class InsertCommentInput {
    @Field()
    text: string;

    @Field()
    articleId: string;
}
