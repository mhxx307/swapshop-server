import { Field, ObjectType } from 'type-graphql';
import IMutationResponse, { FieldError } from './MutationResponse';
import { User } from '../entities';

@ObjectType({ implements: IMutationResponse })
export default class UserMutationResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field({ nullable: true })
    user?: User;

    @Field((type) => [FieldError], { nullable: true })
    errors?: FieldError[];
}
