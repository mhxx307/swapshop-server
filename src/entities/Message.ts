import { STATUS_MESSAGE } from '../constants/message';
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
import Conversation from './Conversation';

@ObjectType()
@Entity('messages')
export default class Message extends BaseEntity {
    @Field((_type) => ID)
    @PrimaryGeneratedColumn()
    id!: string;

    @Field()
    @Column()
    conversationId!: string;

    @Field(() => Conversation)
    @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    conversation: Conversation;

    @Column()
    senderId!: string;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.messages)
    sender: User;

    @Field()
    @Column({
        default: STATUS_MESSAGE.pending,
    })
    status: string;

    @Field()
    @Column()
    text!: string;

    @Field()
    @CreateDateColumn()
    createdDate: Date;

    @Field()
    @UpdateDateColumn()
    updatedDate: Date;
}
