import type { Request, Response, NextFunction } from "express"
import { InternalServerError, UnauthorizedException } from "../../exceptions/errorExceptions";
import { prisma } from "../../prisma";
import { ErrorCodes } from "../../exceptions/root";
import { apiResponse } from "../../utils/apiResponse";

interface ActivityPayload {
    userId: number;
    project: string;
    language: string;
    duration: number;
    file: string;
    keystrokes: number;
    timestamp: string;
}

export const saveEditorActivity = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const apiKey = req.headers['careit-api-key'] as string;

        let rawData: ActivityPayload | ActivityPayload[] = req.body;

        console.log("Received API Key:", apiKey);
        if (!Array.isArray(rawData)) {
            rawData = [rawData as ActivityPayload];
        }

        if (!apiKey) {
            next(new UnauthorizedException("Api Key not provided", ErrorCodes.UNAUTHORIZED_ACCESS));
        }

        const user = await prisma.user.findFirst({
            where: { apiKey },
            select: { apiKey: true, id: true }
        })


        if (!user) {
            next(new UnauthorizedException("Unautorized : user with this apiKey not found", ErrorCodes.INVALID_CREDENTIALS));
        }

        const isValid = user?.apiKey === apiKey;

        if (!isValid) {
            next(new UnauthorizedException("Unautorized : Invalid API Key", ErrorCodes.INVALID_CREDENTIALS));
        }

        await Promise.all(rawData.map(async (activity: any) => {

            const recordDate = new Date(activity.timestamp);
            recordDate.setMinutes(0, 0, 0);

            return prisma.editorActivity.upsert({
                where: {

                    userId_projectName_file_date: {
                        userId: user?.id as number,
                        projectName: activity.project,
                        file: activity.file,
                        date: recordDate
                    }
                },
                update: {
                    duration: { increment: activity.duration },
                    keystrokes: { increment: activity.keystrokes },
                    language: activity.language
                },
                create: {
                    userId: user?.id as number,
                    projectName: activity.project,
                    file: activity.file,
                    language: activity.language,
                    date: recordDate,
                    duration: activity.duration,
                    keystrokes: activity.keystrokes
                }
            });
        }));

        res.status(200).json(new apiResponse({}, "Editor activity saved!", 200))


    } catch (error) {
        console.log(error);
        next(error);
    }

}


