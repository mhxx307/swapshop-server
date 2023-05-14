import { buildDataLoaders } from '../utils/dataLoaders';
import { Request, Response } from 'express';
import { Session, SessionData } from 'express-session';
import { Connection } from 'typeorm';

export type roleAuth = {
    id: string;
    name: string;
};

export interface IMyContext {
    req: Request & {
        session: Session & Partial<SessionData> & { userId?: string };
    };
    res: Response;
    connection: Connection;
    dataLoaders: ReturnType<typeof buildDataLoaders>;
}
