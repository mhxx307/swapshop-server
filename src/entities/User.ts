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
@Entity()
export default class User extends BaseEntity {
    @Field((_type) => ID)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    username!: string;

    @Column()
    password!: string;

    @Field()
    @Column()
    email!: string;

    // @Field({ nullable: true })
    // @Column({nullable: true})
    // address?: string;

    @Field()
    @Column()
    address!: string;

    @Field()
    @CreateDateColumn()
    createAt?: Date;

    @Field()
    @UpdateDateColumn()
    updateAt?: Date;
}
