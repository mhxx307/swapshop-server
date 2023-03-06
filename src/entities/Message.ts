import { Field, ID, ObjectType } from 'type-graphql';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    ManyToOne,
} from 'typeorm';
import User from './User';

@ObjectType()
@Entity('messages')
export default class Message extends BaseEntity {
    @Field((_type) => ID)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    content!: string;

    @Field()
    @Column()
    status!: string;

    @ManyToOne(() => User)
    user: User;

    @Field()
    @CreateDateColumn()
    createdDate: Date;

    @Field()
    @UpdateDateColumn()
    updatedDate: Date;
}
