import { Field, ID, ObjectType } from 'type-graphql';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import User from './User';

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

    // thumbnail string
    // images string[]
    // price
    // category
    // product name

    @Column()
    userId!: string;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.articles)
    user: User;

    @Field()
    @CreateDateColumn({ type: 'timestamptz' })
    createdDate: Date;

    @Field()
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedDate: Date;
}
