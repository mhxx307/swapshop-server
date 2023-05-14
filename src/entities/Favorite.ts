import { Field, ID, ObjectType } from 'type-graphql';
import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    Column,
    ManyToOne,
} from 'typeorm';
import Article from './Article';
import User from './User';

@ObjectType()
@Entity('favorites')
export default class Favorite extends BaseEntity {
    @Field((_type) => ID)
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    articleId!: string;

    @Column()
    userId!: string;

    @Field(() => Article)
    @ManyToOne(() => Article, (article) => article.favorites)
    article: Article;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.favorites)
    user: User;

    @Field()
    @CreateDateColumn()
    createdDate: Date;

    @Field()
    @UpdateDateColumn()
    updatedDate: Date;
}
