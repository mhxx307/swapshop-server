import { Field, ObjectType } from 'type-graphql';
import IMutationResponse, { FieldError } from './mutation-response';
import { Report } from '../../entities';

@ObjectType({ implements: IMutationResponse })
export default class ReportMutationResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field({ nullable: true })
    report?: Report;

    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
}
