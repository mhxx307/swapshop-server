import { Field, ObjectType } from 'type-graphql';
import IMutationResponse, { FieldError } from './mutation-response';
import { User } from '../../entities';

@ObjectType({ implements: IMutationResponse })
export default class UserMutationResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field({ nullable: true })
    user?: User;

    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
}
