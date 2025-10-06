import {Request, Response, NextFunction} from 'express'
import { UnauthorizedException } from '../exceptions/errorExceptions';
import { ErrorCodes } from '../exceptions/root';
import * as jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../secrets';

export const authMiddleWare = async (req: Request, res: Response, next: NextFunction) =>{
    try {
        const {token}  = req.cookies;

        if(!token){
            next(new UnauthorizedException("Token not found", ErrorCodes.UNAUTHORIZED_ACCESS))
        }

        const user = jwt.verify(token, JWT_SECRET);

        if(!user){
            next(new UnauthorizedException("Invalid Token provided", ErrorCodes.UNAUTHORIZED_ACCESS))
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        throw error;
    }
    

}