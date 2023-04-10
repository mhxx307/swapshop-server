import { Field, InputType } from 'type-graphql';

@InputType()
export default class InsertArticleInput {
    @Field()
    title!: string;

    @Field()
    description!: string;

    @Field(() => [String])
    images!: string[];

    @Field(() => [String])
    categoryIds!: string[];

    @Field()
    productName!: string;

    @Field({ nullable: true })
    price: string;
}
