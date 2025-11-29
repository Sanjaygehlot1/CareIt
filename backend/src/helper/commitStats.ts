import { Octokit } from "@octokit/rest";
import { prisma } from "../prisma"

export const getCommitsfromDB = async (date: Date, userId: number) => {

    try {

        const dbCache = await prisma.streakStats.findUnique({
            where: { userId_date: { userId: userId, date } },
            select: { hasStreak: true, updatedAt : true }
        })

        if (dbCache) {
            return dbCache;
        }


    } catch (error) {
        console.log(error)
        throw error;
    }

}

export const getCommitsfromGithub = async (username: string, date: Date, accessToken: string)=>{
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

