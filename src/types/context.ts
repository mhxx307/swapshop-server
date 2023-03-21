import { buildDataLoaders } from '../utils/dataLoaders';
import { Request, Response } from 'express';
import { Session, SessionData } from 'express-session';

export type roleAuth = {
    id: string;
    name: string;
};

export interface IMyContext {
    req: Request & {
        session: Session & Partial<SessionData> & { userId?: string };
    };
    res: Response;
    dataLoaders: ReturnType<typeof buildDataLoaders>;
}
