import { Field, InterfaceType, ObjectType } from 'type-graphql';

@InterfaceType()
export default abstract class IMutationResponse {
    @Field()
    code: number;

    @Field()
    success: boolean;

    @Field({ nullable: true })
    message?: string;
}

@ObjectType()
export class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}
