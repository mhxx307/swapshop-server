import { Field, InputType } from 'type-graphql';

@InputType()
export default class CreateArticleInput {
    @Field()
    title: string;

    @Field()
    description: string;
}
