import { Field, ObjectType } from 'type-graphql';
import { UserRole } from '../../entities';
import IMutationResponse, { FieldError } from './mutation-response';

@ObjectType({ implements: IMutationResponse })
export default class UserRoleMutationResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field(() => UserRole, { nullable: true })
    userRole?: UserRole;

    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
}
