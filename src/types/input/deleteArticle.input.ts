import { Field, InputType } from 'type-graphql';

@InputType()
export default class DeleteArticleInput {
    @Field()
    id: string;
}
