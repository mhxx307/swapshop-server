import { buildDataLoaders } from '../utils/dataLoaders';
import { Request, Response } from 'express';
import { Session, SessionData } from 'express-session';
import { UserAuthPayload } from './auth';

export interface IMyContext {
    req: Request & {
        session: Session & Partial<SessionData> & { userId?: string };
    };
    res: Response;
    user: UserAuthPayload;
    dataLoaders: ReturnType<typeof buildDataLoaders>;
}
