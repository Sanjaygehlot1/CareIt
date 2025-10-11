// helpers/googleAuth.ts
import passport from 'passport';
import { Request, Response, NextFunction } from 'express';

export const authenticateWithGoogle = (options: {
  scope: string[];
  accessType?: string;
  prompt?: string;
  loginHint?: string;
  state?: string;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {

    const authOptions: any = {
      scope: options.scope,
      accessType: options.accessType || 'offline',
      prompt: options.prompt || 'consent',
      state: options.state || 'default'
    };

    if (options.loginHint) {
      (req as any).authInfo = (req as any).authInfo || {};
      (req as any).authInfo.login_hint = options.loginHint;
    }

    passport.authenticate('google', authOptions)(req, res, next);
  };
};