import { Field, ID, ObjectType } from 'type-graphql';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import User from './User';
import Article from './Article';
import Message from './Message';

@ObjectType()
@Entity('conversations')
export default class Conversation extends BaseEntity {
    @Field((_type) => ID)
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    member1Id!: string;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.conversations1)
    member1: User;

    @Column({ type: 'uuid' })
    member2Id!: string;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.conversations2)
    member2: User;

    @Column()
    articleId!: string;

    @Field(() => Article)
    @ManyToOne(() => Article, (article) => article.conversations, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    article: Article;

    @OneToMany(() => Message, (message) => message.conversation)
    messages: Message[];

    @Field()
    @CreateDateColumn()
    createdDate: Date;

    @Field()
    @UpdateDateColumn()
    updatedDate: Date;
}
