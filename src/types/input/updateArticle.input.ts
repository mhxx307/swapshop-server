import { Field, InputType } from 'type-graphql';

@InputType()
export default class UpdateArticleInput {
    @Field()
    id: string;

    @Field({ nullable: true })
    title: string;

    @Field({ nullable: true })
    description: string;
}
