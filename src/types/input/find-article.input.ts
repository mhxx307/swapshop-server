import { Field, InputType } from 'type-graphql';

@InputType()
export default class FindArticleInput {
    @Field()
    id: string;
}
