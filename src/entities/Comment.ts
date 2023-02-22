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
@Entity('comments')
export default class Comment extends BaseEntity {
    @Field((_type) => ID)
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Field()
    @Column({ unique: true })
    content!: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    status: string;

    @Column()
    articleId!: string;

    @Column()
    userId!: string;

    @Field(() => Article)
    @ManyToOne(() => Article, (article) => article.comments)
    article: Article;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.comments)
    user: User;

    @Field()
    @CreateDateColumn()
    createdDate: Date;

    @Field()
    @UpdateDateColumn()
    updatedDate: Date;
}
