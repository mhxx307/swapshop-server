import { Review } from '../entities';
import { Field, InputType, ObjectType } from 'type-graphql';
import { Pagination } from './utils';

@ObjectType()
class ReviewsResponse {
    @Field(() => [Review])
    reviews: Review[];

    @Field(() => Pagination)
    pagination: Pagination;
}

@ObjectType()
export class ReviewResponseSuccess {
    @Field()
    message: string;

    @Field(() => ReviewsResponse, { nullable: true })
    data?: ReviewsResponse;
}

@InputType()
export class ReviewOptions {
    @Field(() => String || Number, { nullable: true })
    limit?: string | number;

    @Field(() => String || Number, { nullable: true })
    page?: string | number;
}
