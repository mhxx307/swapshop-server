import { Field, ID, ObjectType } from 'type-graphql';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import User from './User';

@ObjectType()
@Entity('conversations')
export default class Conversation extends BaseEntity {
    @Field((_type) => ID)
    @PrimaryGeneratedColumn()
    id!: string;

    @Column({ type: 'uuid', array: true })
    memberIds!: string[];

    // Co the bo manytoone va jointable nay cung duoc vi postgresql co ho tro luu array
    @Field(() => [User])
    @ManyToMany(() => User)
    @JoinTable()
    members: User[];

    @Field()
    @CreateDateColumn()
    createdDate: Date;

    @Field()
    @UpdateDateColumn()
    updatedDate: Date;
}
