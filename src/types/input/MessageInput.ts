import { Field, InputType } from 'type-graphql';
import { User } from '../../entities';
import UserInput from './UserInput';

@InputType()
export default class MessageInput {
    @Field()
    content: string;

    @Field()
    status: string;

    @Field(() => UserInput)
    user: User;
}
