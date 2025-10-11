import { Request, Response, NextFunction } from 'express'
import { UnauthorizedException } from '../exceptions/errorExceptions';
import { ErrorCodes } from '../exceptions/root';


export const authMiddleWare = (req : Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Invalidddd Credentials" });
};