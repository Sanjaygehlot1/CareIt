import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException } from '../../exceptions/errorExceptions';
import { ErrorCodes } from '../../exceptions/root';
import { prisma } from "../../prisma";
import { apiResponse } from '../../utils/apiResponse';


export const getStreak = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;

        if (!user) {
            return next(new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED_ACCESS));
        }

        const userStreak = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                currentStreak: true,
                longestStreak: true,
                streakUpdatedAt: true
            }
        });

        if (!userStreak) {
            return res.status(404).json(new apiResponse({}, "User not found", 404));
        }

        // Get week status (always fresh, lightweight query)
        const weekStatus = await getWeekStatus(user.id);

        const now = new Date();
        const lastUpdate = userStreak.streakUpdatedAt;
        const cacheAge = lastUpdate ? now.getTime() - lastUpdate.getTime() : Infinity;
        const ONE_HOUR = 60 * 60 * 1000;

        // If cache is fresh, return cached streak + fresh weekStatus
        if (cacheAge < ONE_HOUR) {
            return res.status(200).json(new apiResponse({
                currentStreak: userStreak.currentStreak,
                longestStreak: userStreak.longestStreak,
                weekStatus
            }, "Streak retrieved", 200));
        }

        // Cache is stale, recalculate
        await recalculateStreak(user.id);

        const updatedStreak = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                currentStreak: true,
                longestStreak: true
            }
        });

        return res.status(200).json(new apiResponse({
            ...updatedStreak,
            weekStatus
        }, "Streak recalculated", 200));

    } catch (error) {
        console.log(error);
        next(error);
    }
};

async function getWeekStatus(userId: number): Promise<boolean[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDay = today.getDay(); 
    const mondayOffset = currentDay === 0 ? -6 : -(currentDay - 1); 
    
    const monday = new Date(today);
    monday.setDate(monday.getDate() + mondayOffset);

    const weekDates: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        weekDates.push(day);
    }

    const weekStreaks = await prisma.streakStats.findMany({
        where: {
            userId,
            date: {
                gte: weekDates[0],
                lte: weekDates[6]
            }
        },
        select: {
            date: true,
            hasStreak: true
        }
    });

    const weekStatus = weekDates.map(date => {
        const dateTime = date.getTime();
        const streak = weekStreaks.find(s => {
            const streakDate = new Date(s.date);
            streakDate.setHours(0, 0, 0, 0);
            return streakDate.getTime() === dateTime;
        });
        return streak?.hasStreak || false;
    });

    return weekStatus; 
}

async function recalculateStreak(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const activeDates = await prisma.streakStats.findMany({
        where: {
            userId,
            hasStreak: true
        },
        select: { date: true },
        orderBy: { date: 'desc' }
    });

    if (activeDates.length === 0) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                currentStreak: 0,
                longestStreak: 0,
                streakUpdatedAt: new Date()
            }
        });
        return;
    }

    const dates = activeDates.map(d => {
        const date = new Date(d.date);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
    });
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Calculate current streak
    let currentStreak = 0;
    const mostRecentDate = dates[0];
    
    if (mostRecentDate >= yesterday.getTime()) {
        let checkDate = mostRecentDate;
        
        for (const date of dates) {
            if (date === checkDate) {
                currentStreak++;
                checkDate -= oneDayMs;
            } else if (date < checkDate) {
                break;
            }
        }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < dates.length; i++) {
        const diff = dates[i - 1] - dates[i];
        
        if (diff === oneDayMs) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    await prisma.user.update({
        where: { id: userId },
        data: {
            currentStreak,
            longestStreak,
            streakUpdatedAt: new Date()
        }
    });
}