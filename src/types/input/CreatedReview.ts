import { Field, InputType } from 'type-graphql';

@InputType()
export default class CreatedReview {
    @Field()
    content: string;

    @Field()
    point?: string;
}
