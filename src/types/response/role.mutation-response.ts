import { Field, ObjectType } from 'type-graphql';
import { Role } from '../../entities';
import IMutationResponse, { FieldError } from './mutation-response';

@ObjectType({ implements: IMutationResponse })
export default class RoleMutationResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field(() => Role, { nullable: true })
    role?: Role;

    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
}
