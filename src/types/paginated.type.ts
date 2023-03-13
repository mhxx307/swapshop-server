import { Field, ObjectType, InputType } from 'type-graphql';
import { Article, Comment } from '../entities';

@InputType()
export default class ChangePasswordLoggedInput {
    @Field()
    newPassword: string;

    @Field()
    oldPassword: string;
}

@ObjectType()
export class Paginated {
    @Field()
    totalCount!: number;

    @Field((_type) => Date)
    cursor!: Date;

    @Field()
    hasMore!: boolean;
}

@ObjectType()
export class PaginatedArticles extends Paginated {
    @Field((_type) => [Article])
    paginatedArticles!: Article[];
}

@ObjectType()
export class PaginatedComments extends Paginated {
    @Field((_type) => [Comment])
    paginatedComments!: Comment[];
}

@InputType()
export class QueryConfig {
    @Field({ nullable: true })
    limit?: string;

    @Field(() => [String], { nullable: true })
    categories?: string[];

    @Field({ nullable: true })
    sort_by?: string;

    @Field({ nullable: true })
    order_by?: string;

    @Field({ nullable: true })
    price_max?: string;

    @Field({ nullable: true })
    price_min?: string;

    @Field({ nullable: true })
    isFree?: string;

    @Field({ nullable: true })
    title?: string;
}
