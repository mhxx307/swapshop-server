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
import Article from './Article';

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
    @ManyToOne(() => Article, (article) => article.conversations)
    article: Article;

    @Field()
    @CreateDateColumn()
    createdDate: Date;

    @Field()
    @UpdateDateColumn()
    updatedDate: Date;
}
