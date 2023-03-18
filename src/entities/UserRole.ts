import { Field, ID, ObjectType } from 'type-graphql';
import {
    BaseEntity,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import Role from './Role';
import User from './User';

@ObjectType()
@Entity('users_roles')
export default class UserRole extends BaseEntity {
    @Field((_type) => ID)
    @PrimaryColumn()
    userId: string;

    @Field((_type) => ID)
    @PrimaryColumn()
    roleId: string;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.roles)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Field(() => Role)
    @ManyToOne(() => Role, (role) => role.users)
    @JoinColumn({ name: 'roleId' })
    role: Role;

    @Field()
    @CreateDateColumn()
    createdDate: Date;

    @Field()
    @UpdateDateColumn()
    updatedDate: Date;
}
