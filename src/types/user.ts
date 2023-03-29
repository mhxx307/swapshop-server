import { Role, User } from '../entities';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
class UserRoleType extends User {
    @Field(() => Role)
    role: Role;
}

export default UserRoleType;
