import { Field, ID, ObjectType } from 'type-graphql';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    OneToMany,
} from 'typeorm';
import Article from './Article';
import Comment from './Comment';

@ObjectType()
@Entity('users')
export default class User extends BaseEntity {
    @Field((_type) => ID)
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Field()
    @Column({ unique: true })
    username!: string;

    @Column()
    password!: string;

    @Field()
    @Column({ unique: true })
    email!: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    address: string;

    @Field({ nullable: true })
    @Column({ nullable: true, unique: true })
    phoneNumber: string;

    @Field()
    @Column()
    fullName!: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    birthday: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    avatar: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    isOnline: boolean;

    @OneToMany(() => Article, (article) => article.user)
    articles: Article[];

    @OneToMany(() => Comment, (comment) => comment.user)
    comments: Comment[];

    @Field()
    @CreateDateColumn()
    createdDate: Date;

    @Field()
    @UpdateDateColumn()
    updatedDate: Date;
}
