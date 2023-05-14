import { Field, ObjectType } from 'type-graphql';
import { Comment } from '../entities';

@ObjectType()
export class Paginated {
    @Field()
    totalCount!: number;

    @Field((_type) => Date, { nullable: true })
    cursor: Date | null;

    @Field()
    hasMore!: boolean;
}

@ObjectType()
export class PaginatedComments extends Paginated {
    @Field((_type) => [Comment], { nullable: true })
    paginatedComments: Comment[] | null;
}
