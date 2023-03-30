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
import { Article, Comment, UserRole, Message } from '.';
import { STATUS_USER } from '../constants/user';

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
    @Column({ nullable: true, default: 0 })
    rating: number;

    @Field(() => [UserRole])
    @OneToMany(() => UserRole, (ur) => ur.user)
    roles: UserRole[];

    @OneToMany(() => Article, (article) => article.user)
    articles: Article[];

    @OneToMany(() => Comment, (comment) => comment.user)
    comments: Comment[];

    @OneToMany(() => Message, (message) => message.sender)
    messages: Message[];

    @Field()
    @Column({
        default: STATUS_USER.ACTIVE,
    })
    status: string;

    @Field()
    @CreateDateColumn()
    createdDate: Date;

    @Field()
    @UpdateDateColumn()
    updatedDate: Date;
}
