import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException } from '../../exceptions/errorExceptions';
import { ErrorCodes } from '../../exceptions/root';
import { prisma } from '../../prisma';
import { apiResponse } from '../../utils/apiResponse';
import { GEMINI_API_KEY } from '../../secrets';
import { GoalType, GoalPeriod } from '@prisma/client';
import { GoogleGenAI } from "@google/genai";
import { syncOneGoal, getWeekStart, getMonthStart } from '../../utils/goalSync';

export const getGoals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;
        if (!user) return next(new UnauthorizedException('Unauthorized', ErrorCodes.UNAUTHORIZED_ACCESS));

        const { period } = req.query;

        const goals = await prisma.goal.findMany({
            where: {
                userId: user.id,
                ...(period ? { period: period as GoalPeriod } : {}),
            },
            orderBy: [{ completed: 'asc' }, { createdAt: 'desc' }]
        });

       
        const synced = await Promise.all(goals.map(g => syncOneGoal(g, user.id)));

        return res.status(200).json(new apiResponse(synced, 'Goals retrieved', 200));
    } catch (error) {
        console.error(error);
        next(error);
    }
};



export const createGoal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;
        if (!user) return next(new UnauthorizedException('Unauthorized', ErrorCodes.UNAUTHORIZED_ACCESS));

        const { title, description, type, period, targetValue, unit, currentValue, completed } = req.body;

        if (!title || !targetValue) {
            return res.status(400).json(new apiResponse({}, 'title and targetValue are required', 400));
        }

        const weekStart = period === 'DAILY' ? new Date(new Date().setTime(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())))
            : period === 'MONTHLY' ? getMonthStart()
                : getWeekStart();

        const goal = await prisma.goal.create({
            data: {
                userId: user.id,
                title,
                description: description || null,
                type: (type as GoalType) || 'CUSTOM',
                period: (period as GoalPeriod) || 'WEEKLY',
                targetValue: Number(targetValue),
                currentValue: currentValue !== undefined ? Number(currentValue) : 0,
                completed: completed !== undefined ? Boolean(completed) : false,
                unit: unit || '',
                weekStart,
            }
        });

        return res.status(201).json(new apiResponse(goal, 'Goal created', 201));
    } catch (error) {
        console.error(error);
        next(error);
    }
};


export const updateGoal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;
        if (!user) return next(new UnauthorizedException('Unauthorized', ErrorCodes.UNAUTHORIZED_ACCESS));

        const { id } = req.params;
        const { title, description, targetValue, unit, completed, currentValue } = req.body;

        const existing = await prisma.goal.findFirst({ where: { id: Number(id), userId: user.id } });
        if (!existing) return res.status(404).json(new apiResponse({}, 'Goal not found', 404));

        const SYSTEM_TRACKED_TYPES = ['CODING_TIME', 'STREAK', 'COMMITS', 'FOCUS_TIME'];
        const isSystemTracked = SYSTEM_TRACKED_TYPES.includes(existing.type);

        if (isSystemTracked && (completed !== undefined || currentValue !== undefined)) {
            return res.status(403).json(new apiResponse(
                {},
                `"${existing.type}" goals are automatically tracked by the platform. Progress cannot be set manually.`,
                403
            ));
        }

        const updated = await prisma.goal.update({
            where: { id: Number(id) },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(targetValue !== undefined && { targetValue: Number(targetValue) }),
                ...(unit !== undefined && { unit }),
                ...(!isSystemTracked && completed !== undefined && { completed }),
                ...(!isSystemTracked && currentValue !== undefined && { currentValue: Number(currentValue) }),
            }
        });

        return res.status(200).json(new apiResponse(updated, 'Goal updated', 200));
    } catch (error) {
        console.error(error);
        next(error);
    }
};


export const deleteGoal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;
        if (!user) return next(new UnauthorizedException('Unauthorized', ErrorCodes.UNAUTHORIZED_ACCESS));

        const { id } = req.params;
        const existing = await prisma.goal.findFirst({ where: { id: Number(id), userId: user.id } });
        if (!existing) return res.status(404).json(new apiResponse({}, 'Goal not found', 404));

        await prisma.goal.delete({ where: { id: Number(id) } });

        return res.status(200).json(new apiResponse({}, 'Goal deleted', 200));
    } catch (error) {
        console.error(error);
        next(error);
    }
};



export const generateAiGoals = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const {period} = req.body;
        const user = req.user as any;
        if (!user) return next(new UnauthorizedException('Unauthorized', ErrorCodes.UNAUTHORIZED_ACCESS));

        if (!GEMINI_API_KEY) {
            return res.status(503).json(new apiResponse({}, 'AI goal generation is not configured', 503));
        }

        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        
        const today = new Date();
        today.setTime(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const [userRecord, recentActivity, streakData, focusData] = await Promise.all([
            prisma.user.findUnique({
                where: { id: user.id },
                select: { name: true, currentStreak: true, longestStreak: true }
            }),
            prisma.editorActivity.groupBy({
                by: ['date'],
                where: { userId: user.id, date: { gte: sevenDaysAgo } },
                _sum: { duration: true },
                orderBy: { date: 'desc' }
            }),
            prisma.streakStats.findMany({
                where: { userId: user.id, date: { gte: thirtyDaysAgo } },
                select: { hasStreak: true, codingDuration: true, date: true }
            }),
            prisma.focusStats.findMany({
                where: { userId: user.id, date: { gte: sevenDaysAgo } },
                select: { duration: true, date: true }
            })
        ]);

       
        const avgDailycodingMin = recentActivity.length > 0
            ? Math.round(recentActivity.reduce((sum, d) => sum + (d._sum.duration || 0), 0) / recentActivity.length / 60)
            : 0;

        const streakDaysLast30 = streakData.filter(s => s.hasStreak).length;
        const avgFocusMin = focusData.length > 0
            ? Math.round(focusData.reduce((sum, f) => sum + f.duration, 0) / focusData.length / 60)
            : 0;

        const dataContext = {
            currentStreak: userRecord?.currentStreak ?? 0,
            longestStreak: userRecord?.longestStreak ?? 0,
            avgDailyCodingMinutesLast7Days: avgDailycodingMin,
            streakDaysInLast30Days: streakDaysLast30,
            avgFocusMinutesPerSession: avgFocusMin,
            daysWithActivityLast7: recentActivity.length,
        };

        
        const prompt = `You are a productivity coach for a developer using CareIt, a developer productivity platform.

Based on this developer's data, generate exactly 3 realistic, personalized weekly goals:

Developer Stats:
- Current coding streak: ${dataContext.currentStreak} days
- Longest streak ever: ${dataContext.longestStreak} days
- Avg daily coding time (last 7 days): ${dataContext.avgDailyCodingMinutesLast7Days} minutes
- Active coding days (last 7 days): ${dataContext.daysWithActivityLast7}/7
- Streak days in last 30 days: ${dataContext.streakDaysInLast30Days}/30
- Avg focus session length: ${dataContext.avgFocusMinutesPerSession} minutes

Rules:
- Goals must be ACHIEVABLE but a slight STRETCH above current baseline
- Each goal must have a clear numeric target (e.g., "Code for 120 minutes/day", "Maintain a 7-day streak")
- Choose goal types from: CODING_TIME, STREAK, FOCUS_TIME, COMMITS
- Keep descriptions concise, motivating, and personalized
- ALL goals must strictly be for the exact period: ${period || 'DAILY'}
- goals should not be repetetive and should be helpful and relevant for the user based on the provided data

Respond ONLY with a valid JSON array (no markdown, no explanation), like:
[
  {
    "title": "...",
    "description": "...",
    "type": "CODING_TIME",
    "period": "${period || 'DAILY'}",
    "targetValue": 600,
    "unit": "minutes"
  }
]`;


        const geminiResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            },
        });


        let suggestions: any[] = [];
        try {
            const parsed = JSON.parse(geminiResponse.text!);
            suggestions = Array.isArray(parsed) ? parsed : [];
        } catch (parseErr) {
            console.error('[AI Goals] Failed to parse Gemini response as JSON:', parseErr);
            throw new Error('AI returned an invalid response. Please try again.');
        }

       
        if (suggestions.length === 0) {
            return res.status(500).json(new apiResponse({}, 'AI returned no goals. Please try again.', 500));
        }

        const weekStart = getWeekStart();

        const created = await Promise.all(
            suggestions.slice(0, 3).map((s: any) =>
                prisma.goal.create({
                    data: {
                        userId: user.id,
                        title: s.title,
                        description: s.description || null,
                        type: (s.type as GoalType) || 'CUSTOM',
                        period: (period as GoalPeriod) || (s.period as GoalPeriod) || 'DAILY',
                        targetValue: Number(s.targetValue),
                        unit: s.unit || '',
                        isAiGenerated: true,
                        weekStart,
                    }
                })
            )
        );

        return res.status(201).json(new apiResponse(
            { goals: created, context: dataContext },
            'AI goals generated',
            201
        ));

    } catch (error) {
        console.error(error);
        next(error);
    }
};

