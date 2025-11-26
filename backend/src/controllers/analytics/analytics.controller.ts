import type { Request, Response, NextFunction } from "express"
import {  UnauthorizedException } from "../../exceptions/errorExceptions";
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

export const getEditorStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;

        if (!user) {
            return next(new UnauthorizedException("Unauthorized : Please Login to continue", ErrorCodes.UNAUTHORIZED_ACCESS));
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);

        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);

        const rawStats = await prisma.editorActivity.groupBy({
            by: ['date'],
            where: {
                userId: user.id,
                date: { gte: sevenDaysAgo, lte: endOfToday }
            },
            _sum: {
                keystrokes: true,
                duration: true
            },
            orderBy: { date: 'asc' }
        });

        const filledStats = [];

        for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgo);
            d.setDate(d.getDate() + i);

            const dateString = d.toISOString().split('T')[0];
            console.log(dateString)

            const foundStat = rawStats.find(stat => {
                console.log(stat.date.toISOString().split('T')[0])
                return stat.date.toISOString().split('T')[0] === dateString
            }
                
            );

            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const formattedDate = `${day}/${month}`;

            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

            filledStats.push({
                date: formattedDate,        
                day: dayName,               
                duration: foundStat?._sum.duration || 0,
                keystrokes: foundStat?._sum.keystrokes || 0
            });
        }

        const message = rawStats.length === 0
            ? "No stats found! Please connect your VS Code extension."
            : "Stats retrieved successfully.";

        return res.status(200).json(new apiResponse(
            filledStats,
            message,
            200
        ));

    } catch (error) {
        console.log(error);
        next(error);
    }
};


