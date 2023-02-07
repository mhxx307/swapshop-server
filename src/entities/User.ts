import { Field, ID, ObjectType } from 'type-graphql';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
} from 'typeorm';

@ObjectType()
@Entity('users')
export default class User extends BaseEntity {
    @Field((_type) => ID)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({ unique: true })
    username!: string;

    @Column()
    password!: string;

    @Field()
    @Column({ unique: true })
    email!: string;

    @Field()
    @Column()
    address!: string;

    @Field()
    @Column({ unique: true })
    phoneNumber!: string;

    @Field()
    @Column()
    fullName!: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    birthday?: Date;

    @Field({ nullable: true })
    @Column({ nullable: true })
    avatar?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    isOnline?: boolean;

    @Field()
    @CreateDateColumn()
    createdDate: Date;

    @Field()
    @UpdateDateColumn()
    updatedDate: Date;
}
