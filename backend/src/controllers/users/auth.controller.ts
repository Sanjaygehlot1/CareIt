import { Request, Response, NextFunction } from "express"
import { prisma } from "../../prisma";
import * as jwt from 'jsonwebtoken'
import { FRONTEND_BASE_URL, JWT_SECRET } from "../../secrets";
import { UnauthorizedException } from "../../exceptions/errorExceptions";
import { ErrorCodes } from "../../exceptions/root";
import { apiResponse } from "../../utils/apiResponse";


export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const user = req.user

        if (!user) {
            next(new UnauthorizedException("You must be logged in. please login and try again", ErrorCodes.UNAUTHORIZED_ACCESS));
        }

        res.status(200).json(new apiResponse(
            user,
            "user found",
            200
        ))

    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const logOut = async (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) { 
      return next(err); 
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Session could not be destroyed.', err);
        return res.status(500).send('Could not log out.');
      }
      
      res.clearCookie('connect.sid');
      
      return res.status(200).send('Logged out successfully.');
    });
  });
}

