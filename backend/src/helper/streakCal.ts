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
        console.log(dateRange)
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
            select: { currentStreak: true },
        })

        const currentStreak = userData?.currentStreak;


        if (dbCache) {
            return {
                current_streak: currentStreak,
                data: dbCache
            }
        }


    } catch (error) {
        console.log(error)
        throw error;
    }

}

export const getCommitsfromGithubOnaDate = async (username: string, date: string, accessToken: string) => {
    try {
        const octakit = new Octokit({ auth: accessToken })
        const commit = await octakit.rest.search.commits({
            q: `author : ${username} committer-date: ${date}`,
            per_page: 1
        })

        const hasCommit = commit.data.total_count > 0

        if (hasCommit) {
            return {
                hasCommit,
                totalCommits: commit.data.total_count,
                firstCommit: hasCommit ? commit.data.items[0] : null
            };
        }
        return {
            hasCommit
        }
    } catch (error) {
        console.log(error)
        throw error;
    }
}







