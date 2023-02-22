import { Field, InputType } from 'type-graphql';

@InputType()
export default class RegisterInput {
    @Field()
    username: string;

    @Field()
    email: string;

    @Field()
    password: string;

    @Field({ nullable: true })
    address: string;

    @Field({ nullable: true })
    phoneNumber: string;

    @Field()
    fullName: string;

    @Field({ nullable: true })
    avatar: string;

    @Field({ nullable: true })
    birthday: string;
}
