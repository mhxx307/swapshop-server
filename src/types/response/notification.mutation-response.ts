import { Field, ObjectType } from 'type-graphql';
import IMutationResponse, { FieldError } from './mutation-response';
import { Notification } from '../../entities';

@ObjectType({ implements: IMutationResponse })
export default class NotificationMutationResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field({ nullable: true })
    notification?: Notification;

    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
}
