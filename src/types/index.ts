import { buildDataLoaders } from '../utils/dataLoaders';
import { Request, Response } from 'express';
import { Session, SessionData } from 'express-session';
import { Field, ObjectType } from 'type-graphql';
import { Article } from '../entities';

export interface IMyContext {
    req: Request & {
        session: Session & Partial<SessionData> & { userId?: string };
    };
    res: Response;
    dataLoaders: ReturnType<typeof buildDataLoaders>;
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
