import { Field, InputType } from 'type-graphql';

@InputType()
export default class CreatedComment {
    @Field()
    content: string;

    @Field()
    status?: string;
}
