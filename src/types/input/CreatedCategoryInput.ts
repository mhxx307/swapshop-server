import { Field, InputType } from 'type-graphql';

@InputType()
export default class CreatedCategoryInput {
    @Field()
    name: string;

    @Field()
    description?: string;
}
