import { Request, Response, NextFunction } from "express"
import { prisma } from "../../prisma";
import * as jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../../secrets";
import { UnauthorizedException } from "../../exceptions/errorExceptions";
import { ErrorCodes } from "../../exceptions/root";
import { apiResponse } from "../../utils/apiResponse";

interface UserInterface {

    name: string,
    email: string,
    provider: string,
    providerId: string,
    profileUrl: string,
    accessToken: string,
    refreshToken: string

}

export const signUp = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const profile = req.user as UserInterface;

        const user = await prisma.user.upsert({
            where: { providerId: profile.providerId },
            create: {
                name: profile.name,
                email: profile.email,
                provider: profile.provider,
                profileUrl: profile.profileUrl,
                providerId: profile.providerId
            },
            update: {
                profileUrl: profile.profileUrl
            }

        })

        const data = {
            providerId: user.providerId,
            name: user.name,
            email: user.email
        }


        const token = jwt.sign(data, JWT_SECRET)

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24,
        })

        res.redirect('/auth/profile')
    } catch (error) {
        console.log(error)
        throw error;
    }



}

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as UserInterface;

        const data = await prisma.user.findUnique({
            where: {providerId : user.providerId}
        })

        if(!data){
            next(new UnauthorizedException("User not found", ErrorCodes.USER_NOT_FOUND))
        }

        res.status(200).json(new apiResponse(
            data,
            "user found",
            200
        ))

    } catch (error) {
        console.log(error);
        throw error;
    }
}

