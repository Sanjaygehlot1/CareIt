import type { Request, Response, NextFunction } from "express"
import crypto from 'crypto'
import { UnauthorizedException } from "../../exceptions/errorExceptions";
import { apiResponse } from "../../utils/apiResponse";
import { prisma } from "../../prisma";

const generateKey = () => {
    return `careit_${crypto.randomBytes(16).toString('hex')}`;
};

export const generateApiKey = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const user = (req.user as any);
        console.log("USER::",req.user)
        

        if (!user) {
            next(new UnauthorizedException("Unautorized : Login to continue", 401));
        }

        const apiKey = generateKey();
        console.log("GOOGLE_ID",user.googleProviderId)

        await prisma.user.update({
            where: { googleProviderId: user.googleProviderId },
            data: {
                apiKey
            }

        })

        res.status(200).json(new apiResponse({
            apiKey
        }, "New API Key generated. please copy it immediately!.",
            200))


    } catch (error) {
        console.log("Error generating ApiKey: ", error)
        next(error);
    }


}

export const getApiKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req.user as any);

        if (!user) {
            next(new UnauthorizedException("Unautorized : Login to continue", 401));
        }

        const Exisitnguser = await prisma.user.findFirst({
            where: { googleProviderId: user.googleProviderId },
            select: { apiKey: true }
        })

        res.status(200).json(new apiResponse({
            apiKey: Exisitnguser?.apiKey
        }, "API Key fetched successfully!", 200))

    } catch (error) {
        console.log("Error fetching API Key", error);
        next(error);
    }

}