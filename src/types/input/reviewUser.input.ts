import { Field, InputType } from 'type-graphql';

@InputType()
export default class ReviewUserInput {
    @Field()
    userId: string;

    @Field()
    content: string;

    @Field()
    rating: number;
}
