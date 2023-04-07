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

@ObjectType()
@Entity('reviews')
export default class Review extends BaseEntity {
    @Field((_type) => ID)
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Field()
    @Column({ unique: true })
    content!: string;

    @Column({ default: 0 })
    rating: number;

    @Column()
    userId!: string;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.review)
    user: User;

    @Column()
    assessorId!: string;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.review)
    assessor: User;

    @Field()
    @CreateDateColumn()
    createdDate: Date;

    @Field()
    @UpdateDateColumn()
    updatedDate: Date;
}
