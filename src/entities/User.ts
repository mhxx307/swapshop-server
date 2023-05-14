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
import {
    Article,
    Comment,
    UserRole,
    Message,
    Favorite,
    Conversation,
    Review,
    Notification,
} from '.';
import { STATUS_USER } from '../constants/user';
import Report from './Report';

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

    @OneToMany(() => Review, (review) => review.user)
    review: Review[];

    @Field(() => [UserRole])
    @OneToMany(() => UserRole, (ur) => ur.user)
    roles: UserRole[];

    @OneToMany(() => Article, (article) => article.user)
    articles: Article[];

    @OneToMany(() => Comment, (comment) => comment.user)
    comments: Comment[];

    @OneToMany(() => Message, (message) => message.sender)
    messages: Message[];

    @OneToMany(() => Report, (report) => report.user)
    reports: Report[];

    @OneToMany(() => Favorite, (favorite) => favorite.user)
    favorites: Favorite[];

    @OneToMany(() => Favorite, (favorite) => favorite.user)
    notifications: Notification[];

    @OneToMany(() => Conversation, (conversation) => conversation.member1)
    conversations1: Conversation[];

    @OneToMany(() => Conversation, (conversation) => conversation.member2)
    conversations2: Conversation[];

    @Field()
    @Column({
        default: STATUS_USER.ACTIVE,
    })
    status: string;

    @Field()
    @Column({ default: 0 })
    rating: number;

    @Field()
    @Column({ default: false })
    isVerified: boolean;

    @Field()
    @CreateDateColumn()
    createdDate: Date;

    @Field()
    @UpdateDateColumn()
    updatedDate: Date;
}
