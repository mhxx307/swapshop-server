import { Field, InputType } from 'type-graphql';

@InputType()
export default class CreateArticleInput {
    @Field()
    title: string;

    @Field()
    description: string;

    @Field()
    thumbnail!: string;

    // @Field(() => [String], { nullable: true })
    // images: string[];

    @Field({ nullable: true })
    price: number;

    @Field({ nullable: true })
    discount: number;

    @Field()
    productName!: string;
}
