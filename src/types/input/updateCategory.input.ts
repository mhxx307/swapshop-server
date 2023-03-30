import { Field, ID, InputType } from 'type-graphql';

@InputType()
export default class UpdateCategoryInput {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field()
    image: string;
}
