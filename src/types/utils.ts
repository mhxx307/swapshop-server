import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Pagination {
    @Field(() => Number || String)
    page: string | number;

    @Field(() => Number || String)
    limit: string | number;

    @Field(() => Number || String)
    page_size: string | number;
}
