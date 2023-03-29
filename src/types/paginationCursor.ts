import { Field, ObjectType } from 'type-graphql';
import { Comment } from '../entities';

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
export class PaginatedComments extends Paginated {
    @Field((_type) => [Comment])
    paginatedComments!: Comment[];
}
