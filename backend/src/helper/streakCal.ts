import { Octokit } from "@octokit/rest";
import { prisma } from "../prisma"

function getMonthDates(year: number, month: number) {

    const startString = `${year}-${String(month).padStart(2, '0')}-01`;


    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

    const endString = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    return {
        start: startString,
        end: endString
    };
}

export const getMonthStreakfromDB = async (year: number, month: number, userId: number) => {

    try {
        const dateRange = getMonthDates(year, month)
        const dbCache = await prisma.streakStats.findMany({
            where: {
                date: {
                    gte: new Date(dateRange.start),
                    lte: new Date(dateRange.end)

                },
                userId,
                hasStreak: true
            },
            select: { hasStreak: true, updatedAt: true, date: true },
            orderBy: { date: 'asc' }
        })

        const userData = await prisma.user.findFirst({
            where: { id: userId },
            select: { currentStreak: true, longestStreak: true },
        })

        const currentStreak = userData?.currentStreak;
        const longestStreak = userData?.longestStreak;


        if (dbCache) {
            return {
                current_streak: currentStreak,
                longest_streak: longestStreak,
                data: dbCache
            }
        }


    } catch (error) {
        console.log(error)
        throw error;
    }

}


