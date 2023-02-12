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
@Entity('categories')
export default class Category extends BaseEntity {
    @Field((_type) => ID)
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Field()
    @Column({ unique: true })
    name!: string;

    @Column()
    description?: string;

    @Field()
    @CreateDateColumn()
    createdDate: Date;

    @Field()
    @UpdateDateColumn()
    updatedDate: Date;
}
