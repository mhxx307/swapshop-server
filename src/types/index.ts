import { Request, Response } from 'express';
import { Session, SessionData } from 'express-session';
import { Field, Int, ObjectType } from 'type-graphql';
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

    @Field((_type) => Date)
    cursor!: Date;

    @Field()
    hasMore!: boolean;

    @Field((_type) => [Article])
    paginatedArticles!: Article[];
}
