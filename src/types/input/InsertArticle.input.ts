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

    @Field({ defaultValue: '0' })
    price: string;

    @Field()
    address: string;
}
