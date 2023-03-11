import { Field, InputType } from 'type-graphql';

@InputType()
export default class UpdateProfileInput {
    @Field({ nullable: true })
    username: string;

    @Field({ nullable: true })
    address: string;

    @Field({ nullable: true })
    phoneNumber: string;

    @Field({ nullable: true })
    fullName: string;

    @Field({ nullable: true })
    birthday: string;
}
