import type { Request, Response, NextFunction } from "express"
import { UnauthorizedException } from "../../exceptions/errorExceptions";
import { prisma } from "../../prisma";

export const saveEditorActivity = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const apiKey = req.header('careit-api-key');
        if (!apiKey) {
            next(new UnauthorizedException("Api Key not provided", 401));
        }

        const user = await prisma.user.findFirst({
            where : { apiKey }
        })


        if(!user){
             next(new UnauthorizedException("Unautorized : Invalid ApiKey", 401));
        }
        

        await prisma.
    } catch (error) {

    }

}