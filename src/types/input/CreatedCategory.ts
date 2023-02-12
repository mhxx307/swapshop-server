import { Field, InputType } from 'type-graphql';

@InputType()
export default class CreatedCategory {
    @Field()
    name: string;

    @Field()
    description?: string;
}
