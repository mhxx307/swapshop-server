import { Field, InputType } from 'type-graphql';

@InputType()
export default class UserInput {
    @Field()
    id: number;
}
