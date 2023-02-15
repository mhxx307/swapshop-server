import { Request, Response } from 'express';
import { Session, SessionData } from 'express-session';
import { Field, ObjectType } from 'type-graphql';
import { Article } from '../entities';

export interface IMyContext {
    req: Request & {
        session: Session & Partial<SessionData> & { userId?: string };
    };
    res: Response;
}

@ObjectType()
export class PaginatedArticles {
    @Field()
    totalCount!: number;

    @Field(() => String)
    endCursor!: string;

    @Field()
    hasMore!: boolean;

    @Field(() => [Article])
    articles!: Article[];
}
