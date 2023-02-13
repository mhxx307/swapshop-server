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

    @Field()
    fullName: string;

    @Field({ nullable: true })
    avatar?: string;

    @Field({ nullable: true })
    birthday?: string;
}
