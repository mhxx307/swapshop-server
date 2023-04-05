import { Field, InputType } from 'type-graphql';
import InsertArticleInput from './InsertArticle.input';

@InputType()
export default class UpdateArticleInput extends InsertArticleInput {
    @Field()
    id: string;

    @Field()
    status: string;
}
