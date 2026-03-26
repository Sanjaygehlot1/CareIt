import type { Request, Response, NextFunction } from "express"
import { UnauthorizedException } from "../../exceptions/errorExceptions";
import { prisma } from "../../prisma";
import { ErrorCodes } from "../../exceptions/root";
import { apiResponse } from "../../utils/apiResponse";
import { Prisma } from "@prisma/client";
import { triggerGoalSync } from "../../utils/goalSync";

const userCache = new Map<string, { id: number; expires: number }>();

export const saveEditorActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const apiKey = req.headers["careit-api-key"] as string;
        if (!apiKey) return next(new UnauthorizedException("API key missing", ErrorCodes.UNAUTHORIZED_ACCESS));

        let cached = userCache.get(apiKey);
        if (!cached || cached.expires < Date.now()) {
            const user = await prisma.user.findUnique({
                where: { apiKey },
                select: { id: true }
            });

            if (!user) return next(new UnauthorizedException("Invalid API key", ErrorCodes.INVALID_CREDENTIALS));

            cached = { id: user.id, expires: Date.now() + 10 * 60 * 1000 };
            userCache.set(apiKey, cached);
        }

        const userId = cached.id;

        const activities = Array.isArray(req.body) ? req.body : [req.body];
        const values = activities.map(a => {
            const d = new Date(a.timestamp);
            d.setTime(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); 

            return Prisma.sql`(${userId}, ${a.project}, ${d}, ${a.duration})`;  
        });

            
        await prisma.$executeRaw`
            INSERT INTO "EditorActivity"
                ("userId", "projectName", "date", "duration")
            VALUES 
                ${Prisma.join(values)}
            ON CONFLICT ("userId", "projectName", "date")
            DO UPDATE SET
                duration = "EditorActivity".duration + EXCLUDED.duration
        `;

        
        await updateUserStreak(userId);

        triggerGoalSync(userId, ['CODING_TIME', 'STREAK']);

        return res.status(200).json(new apiResponse({}, "Editor activity saved!", 200));
    }
    catch (err) {
        console.error(err);
        next(err);
    }
};

            
async function updateUserStreak(userId: number) {
    const today = new Date();
    today.setTime(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    
    const todayActivity = await prisma.editorActivity.aggregate({
        where: { 
            userId, 
            date: today 
        },
        _sum: { duration: true }
    });

    const totalToday = todayActivity._sum.duration ?? 0;
    const streakRequirement = 30 * 60;  

    const hasStreakToday = totalToday >= streakRequirement;

        
    await prisma.streakStats.upsert({
        where: { 
            userId_date: { userId, date: today } 
        },
        update: { 
            hasStreak: hasStreakToday,
            codingDuration: totalToday 
        },
        create: { 
            userId, 
            date: today, 
            hasStreak: hasStreakToday, 
            codingDuration: totalToday 
        }
    });

        
    if (!hasStreakToday) {
        return;     
    }

        
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayStreak = await prisma.streakStats.findUnique({
        where: {
            userId_date: { userId, date: yesterday }
        }
    });

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
            currentStreak: true, 
            longestStreak: true,
            streakUpdatedAt: true 
        }
    });

    if (!user) return;

        
    const lastUpdate = user.streakUpdatedAt ? new Date(user.streakUpdatedAt) : null;
    const alreadyUpdatedToday = lastUpdate && 
        lastUpdate.getFullYear() === today.getFullYear() &&
        lastUpdate.getMonth() === today.getMonth() &&
        lastUpdate.getDate() === today.getDate();

    if (alreadyUpdatedToday) {
        return;     
    }

    let newCurrentStreak: number;

         
    if (yesterdayStreak?.hasStreak) {
            
        newCurrentStreak = user.currentStreak + 1;
    } else {
        
        newCurrentStreak = 1;
    }

    const newLongestStreak = Math.max(user.longestStreak, newCurrentStreak);

        
    await prisma.user.update({
        where: { id: userId },
        data: {
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            streakUpdatedAt: new Date()
        }
    });
}

export const getEditorStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;

        if (!user) {
            return next(new UnauthorizedException("Unauthorized : Please Login to continue", ErrorCodes.UNAUTHORIZED_ACCESS));
        }

        const range = Number(req.query.range) || 7;
        const today = new Date();
        today.setTime(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - (range - 1));

        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);

        const rawStats = await prisma.editorActivity.groupBy({
            by: ['date'],
            where: {
                userId: user.id,
                date: { gte: startDate, lte: endOfToday }
            },
            _sum: {
                duration: true
            },
            orderBy: { date: 'asc' }
        });

        const focusStats = await prisma.focusStats.findMany({
            where: {
                userId: user.id,
                date: { gte: startDate, lte: endOfToday }
            }
        });

        const filledStats = [];

        for (let i = 0; i < range; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);

            const foundStat = rawStats.find(stat => {
                const statDate = new Date(stat.date);
                return statDate.getFullYear() === d.getFullYear() &&
                    statDate.getMonth() === d.getMonth() &&
                    statDate.getDate() === d.getDate();
            });


            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const formattedDate = `${day}/${month}`;

            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

            const foundFocus = focusStats.find(f => {
                const fDate = new Date(f.date);
                return fDate.getFullYear() === d.getFullYear() &&
                    fDate.getMonth() === d.getMonth() &&
                    fDate.getDate() === d.getDate();
            });

            filledStats.push({
                date: formattedDate,
                day: dayName,
                duration: foundStat?._sum.duration || 0,
                focusDuration: foundFocus?.duration || 0
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



