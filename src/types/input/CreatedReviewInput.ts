import { Field, InputType } from 'type-graphql';

@InputType()
export default class CreatedReviewInput {
    @Field()
    content: string;

    @Field()
    point?: string;
}
