import { Request, Response } from 'express';
import { Session, SessionData } from 'express-session';

// ctrl + . => view type
export interface IMyContext {
    req: Request & {
        session: Session & Partial<SessionData> & { userId?: string };
    };
    res: Response;
}
