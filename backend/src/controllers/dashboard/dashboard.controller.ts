import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma';
import { apiResponse } from '../../utils/apiResponse';
import { UnauthorizedException } from '../../exceptions/errorExceptions';
import { ErrorCodes } from '../../exceptions/root';
import { syncOneGoal } from '../../utils/goalSync';

export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;
        if (!user) return next(new UnauthorizedException('Unauthorized', ErrorCodes.UNAUTHORIZED_ACCESS));

        const userId = user.id;


        const userRecord = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                profileUrl: true,
                calendar: true,
                currentStreak: true,
                longestStreak: true,
                burnoutScore: true,
                burnoutLevel: true,
                dailyDigestEnabled: true,
                aiSummary: true,
                aiSummaryUpdatedAt: true,
                geminiApiKey: true
            }
        });

        if (!userRecord) return res.status(404).json(new apiResponse({}, 'User not found', 404));

        const today = new Date();
        today.setTime(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        const currentDay = today.getDay();
        const mondayOffset = currentDay === 0 ? -6 : -(currentDay - 1);
        const monday = new Date(today);
        monday.setDate(monday.getDate() + mondayOffset);

        const weekDates: number[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            weekDates.push(d.getTime());
        }

        const weekRecords = await prisma.streakStats.findMany({
            where: {
                userId,
                date: { gte: new Date(weekDates[0]), lte: new Date(weekDates[6]) }
            },
            select: { date: true, hasStreak: true, codingDuration: true, commitCount: true, todayPriority: true }
        });

        const streakMap = new Map<number, boolean>();
        weekRecords.forEach(r => {
            const d = new Date(r.date);
            d.setTime(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            streakMap.set(d.getTime(), r.hasStreak);
        });
        const weekStatus = weekDates.map(time => streakMap.get(time) || false);


        const goals = await prisma.goal.findMany({
            where: { userId },
            orderBy: [{ completed: 'asc' }, { createdAt: 'desc' }],
            take: 10 
        });
        const syncedGoals = await Promise.all(goals.map(g => syncOneGoal(g, userId)));


        const range = 7;
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - (range - 1));
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);

        const rawStats = await prisma.editorActivity.groupBy({
            by: ['date'],
            where: { userId, date: { gte: startDate, lte: endOfToday } },
            _sum: { duration: true }
        });

        const focusStats = await prisma.focusStats.findMany({
            where: { userId, date: { gte: startDate, lte: endOfToday } }
        });

        const statsMap = new Map<number, { duration: number; focus: number }>();
        rawStats.forEach(s => {
            const d = new Date(s.date);
            d.setTime(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            statsMap.set(d.getTime(), { duration: s._sum.duration || 0, focus: 0 });
        });
        focusStats.forEach(f => {
            const d = new Date(f.date);
            d.setTime(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            const existing = statsMap.get(d.getTime()) || { duration: 0, focus: 0 };
            statsMap.set(d.getTime(), { ...existing, focus: f.duration });
        });

        const filledStats = [];
        for (let i = 0; i < range; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const time = d.getTime();
            const data = statsMap.get(time) || { duration: 0, focus: 0 };
            
            filledStats.push({
                date: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                duration: data.duration,
                focusDuration: data.focus
            });
        }

        
        const notes = await prisma.note.findMany({
            where: { userId },
            orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
            take: 5
        });

       
        const todayRecord = weekRecords.find(r => {
             const rd = new Date(r.date);
             return rd.getUTCDate() === today.getUTCDate() && rd.getUTCMonth() === today.getUTCMonth();
        });

        const focusStatsToday = focusStats.find(f => {
             const fd = new Date(f.date);
             return fd.getUTCDate() === today.getUTCDate() && fd.getUTCMonth() === today.getUTCMonth();
        });

        const dashboardFocusStats = {
            todayCodingMins: Math.round((todayRecord?.codingDuration || 0) / 60),
            todayCommits: todayRecord?.commitCount || 0,
            meetingCount: 0, 
            meetingHours: 0,
            tasksCompleted: syncedGoals.filter(g => g.completed && g.period === 'DAILY').length,
            tasksTotal: syncedGoals.filter(g => g.period === 'DAILY').length
        };

        const summary = {
            profile: {
                ...userRecord,
                email: userRecord.email
            },
            priority: todayRecord?.todayPriority || '',
            focusStats: dashboardFocusStats,
            streak: {
                current: userRecord.currentStreak,
                longest: userRecord.longestStreak,
                weekStatus
            },
            goals: syncedGoals,
            stats: filledStats,
            notes: notes,
            aiCoach: {
                summary: userRecord.aiSummary,
                updatedAt: userRecord.aiSummaryUpdatedAt
            }
        };

        return res.status(200).json(new apiResponse(summary, 'Dashboard summary retrieved successfully', 200));

    } catch (error) {
        console.error('Dashboard Summary Error:', error);
        next(error);
    }
};
