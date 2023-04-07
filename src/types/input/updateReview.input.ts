import { Field, InputType } from 'type-graphql';

@InputType()
export default class UpdateReviewInput {
    @Field()
    reviewId: string;

    @Field()
    content: string;

    @Field()
    rating: number;
}
