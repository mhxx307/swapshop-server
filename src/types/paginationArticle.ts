import { Field, ObjectType, InputType } from 'type-graphql';
import { Article } from '../entities';
import { Pagination } from './utils';

@ObjectType()
class ArticlesResponse {
    @Field(() => [Article])
    articles: Article[];

    @Field(() => Pagination)
    pagination: Pagination;
}

@ObjectType()
export class ArticleResponseSuccess {
    @Field()
    message: string;

    @Field(() => ArticlesResponse, { nullable: true })
    data?: ArticlesResponse;
}

@InputType()
export class QueryConfig {
    @Field(() => String || Number, { nullable: true })
    limit?: string | number;

    @Field(() => [String], { nullable: true })
    categories?: string[];

    @Field({ nullable: true })
    sort_by?: string;

    @Field({ nullable: true })
    order_by?: string;

    @Field(() => String || Number, { nullable: true })
    price_max?: string | number;

    @Field(() => String || Number, { nullable: true })
    price_min?: string | number;

    @Field({ nullable: true })
    title?: string;

    @Field(() => String || Number, { nullable: true })
    page?: string | number;

    @Field({ nullable: true })
    userId?: string;

    @Field(() => String || Number, { nullable: true })
    user_rating?: string | number;

    @Field({ nullable: true })
    status?: string;
}
