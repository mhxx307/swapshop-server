import { Field, InputType } from 'type-graphql';

@InputType()
export default class ChangePasswordLoggedInput {
    @Field()
    newPassword: string;

    @Field()
    oldPassword: string;
}
