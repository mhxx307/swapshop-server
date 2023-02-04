import { Field, InputType } from 'type-graphql';

@InputType()
export default class RegisterInput {
    @Field()
    username: string;

    @Field()
    email: string;

    @Field()
    password: string;

    @Field()
    address: string;

    @Field()
    phoneNumber: string;

    @Field({ nullable: true })
    avatar: string;
}
