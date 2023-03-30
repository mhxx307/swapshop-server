import { Field, ObjectType } from 'type-graphql';
import IMutationResponse, { FieldError } from './mutation-response';
import { Favorite } from '../../entities';

@ObjectType({ implements: IMutationResponse })
export default class FavoriteMutationResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field({ nullable: true })
    favorite?: Favorite;

    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
}
