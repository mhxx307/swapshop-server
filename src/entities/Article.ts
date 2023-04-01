import { STATUS_ARTICLE } from './../constants/article';
import { Field, ID, ObjectType } from 'type-graphql';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import User from './User';
import Comment from './Comment';
import Category from './Category';
import Favorite from './Favorite';

@ObjectType()
@Entity('articles')
export default class Article extends BaseEntity {
    @Field((_type) => ID)
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Field()
    @Column()
    title!: string;

    @Field()
    @Column()
    description!: string;

    @Field()
    @Column()
    thumbnail!: string;

    @Field(() => [String])
    @Column('text', { array: true, nullable: true })
    images: string[];

    @Field({ nullable: true })
    @Column({ nullable: true })
    price: number;

    @Field()
    @Column()
    productName!: string;

    @Column({ type: 'uuid', array: true })
    categoryIds!: string[];

    // Co the bo manytoone va jointable nay cung duoc vi postgresql co ho tro luu array
    @Field(() => [Category])
    @ManyToMany(() => Category)
    @JoinTable()
    categories: Category[];

    @Column()
    userId!: string;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.articles)
    user: User;

    @OneToMany(() => Comment, (comment) => comment.article)
    comments: Comment[];

    @OneToMany(() => Favorite, (favorite) => favorite.article)
    favorites: Favorite[];

    @Field()
    @Column({
        default: STATUS_ARTICLE.ACTIVE,
    })
    status: string;

    @Field()
    @CreateDateColumn({ type: 'timestamptz' })
    createdDate: Date;

    @Field()
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedDate: Date;
}
