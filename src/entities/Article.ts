import { Field, ID, ObjectType } from 'type-graphql';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import User from './User';
import Comment from './Comment';

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

    @Field(() => [String], { nullable: true })
    @Column({ nullable: true })
    images: string[];

    @Field()
    @Column({ nullable: true })
    price: number;

    @Field()
    @Column({ nullable: true })
    discount: number;

    @Field()
    @Column()
    productName!: string;

    // category

    @Column()
    userId!: string;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.articles)
    user: User;

    @OneToMany(() => Comment, (comment) => comment.article)
    comments: Comment[];

    @Field()
    @CreateDateColumn({ type: 'timestamptz' })
    createdDate: Date;

    @Field()
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedDate: Date;
}
