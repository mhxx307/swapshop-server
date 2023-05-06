import { Field, InputType } from 'type-graphql';

@InputType()
export class OptionsUser {
    @Field({ nullable: true })
    limit: string;

    @Field({ nullable: true })
    order_by: string;

    @Field({ nullable: true })
    sort_by: string;
}
