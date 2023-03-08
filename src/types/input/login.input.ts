import { Field, InputType } from 'type-graphql';

@InputType()
export default class LoginInput {
    @Field()
    usernameOrEmail: string;

    @Field()
    password: string;
}
