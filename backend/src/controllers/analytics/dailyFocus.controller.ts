import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma';
import { apiResponse } from '../../utils/apiResponse';
import { UnauthorizedException } from '../../exceptions/errorExceptions';
import { ErrorCodes } from '../../exceptions/root';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY, GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../../secrets';
import { google } from 'googleapis';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });


export const getDailyFocusStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;
        if (!user) return next(new UnauthorizedException('Unauthorized', ErrorCodes.UNAUTHORIZED_ACCESS));

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);


        const editorAgg = await prisma.editorActivity.aggregate({
            where: { userId: user.id, date: { gte: today, lte: endOfToday } },
            _sum: { duration: true },
        });
        const todayCodingMins = Math.round((editorAgg._sum.duration ?? 0) / 60);


        const todayStreak = await prisma.streakStats.findUnique({
            where: { userId_date: { userId: user.id, date: today } },
            select: { commitCount: true },
        });
        const todayCommits = todayStreak?.commitCount ?? 0;

        let meetingCount = 0;
        let meetingHours = 0;

        if (user.googleRefreshToken) {
            try {
                const OAuth2 = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL);
                OAuth2.setCredentials({ refresh_token: user.googleRefreshToken });
                const calendar = google.calendar({ version: 'v3', auth: OAuth2 });

                const eventsRes = await calendar.events.list({
                    calendarId: 'primary',
                    timeMin: today.toISOString(),
                    timeMax: endOfToday.toISOString(),
                    singleEvents: true,
                    maxResults: 50,
                    fields: 'items(start,end,summary,hangoutLink,conferenceData,location,attendees,description)',
                });

                const events = eventsRes.data.items ?? [];
                
                const meetings = events.filter(ev => {
                    const hasConferenceData = !!ev.hangoutLink || !!ev.conferenceData;
                    
                    const textToSearch = `${ev.location || ''} ${ev.description || ''} ${ev.summary || ''}`.toLowerCase();
                    const hasExternalMeetingLink = textToSearch.includes('zoom.us') || 
                                                   textToSearch.includes('teams.microsoft') || 
                                                   textToSearch.includes('webex.com');
                                                   
                    const hasMultipleAttendees = ev.attendees && ev.attendees.length > 1;

                    return hasConferenceData || hasExternalMeetingLink || hasMultipleAttendees;
                });

                meetingCount = meetings.length;
                meetingHours = meetings.reduce((sum, ev) => {
                    const start = ev.start?.dateTime ? new Date(ev.start.dateTime) : null;
                    const end   = ev.end?.dateTime   ? new Date(ev.end.dateTime)   : null;
                    if (start && end) {
                        return sum + (end.getTime() - start.getTime()) / 3600000;
                    }
                    return sum;
                }, 0);
                meetingHours = Math.round(meetingHours * 10) / 10;
            } catch {
               
            }
        }

        const [tasksCompleted, tasksTotal] = await Promise.all([
            prisma.goal.count({ where: { userId: user.id, period: 'DAILY', completed: true } }),
            prisma.goal.count({ where: { userId: user.id, period: 'DAILY' } }),
        ]);

        return res.status(200).json(new apiResponse(
            { todayCodingMins, todayCommits, meetingCount, meetingHours, tasksCompleted, tasksTotal },
            'Daily focus stats fetched',
            200,
        ));
    } catch (err) {
        next(err);
    }
};


export const getTodayPriority = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;
        if (!user) return next(new UnauthorizedException('Unauthorized', ErrorCodes.UNAUTHORIZED_ACCESS));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const streakStat = await prisma.streakStats.findUnique({
            where: { userId_date: { userId: user.id, date: today } },
            select: { todayPriority: true } as any,
        }) as any;

        return res.status(200).json(new apiResponse(
            { priority: streakStat?.todayPriority ?? '' },
            'Priority fetched',
            200,
        ));
    } catch (err) {
        next(err);
    }
};


export const setTodayPriority = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;
        if (!user) return next(new UnauthorizedException('Unauthorized', ErrorCodes.UNAUTHORIZED_ACCESS));

        const { priority } = req.body;
        if (typeof priority !== 'string' || priority.trim().length === 0) {
            return res.status(400).json(new apiResponse({}, 'Priority text is required', 400));
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await (prisma.streakStats.upsert as any)({
            where: { userId_date: { userId: user.id, date: today } },
            update: { todayPriority: priority.trim() },
            create: {
                userId: user.id,
                date: today,
                hasStreak: false,
                codingDuration: 0,
                commitCount: 0,
                todayPriority: priority.trim(),
            },
        });

        return res.status(200).json(new apiResponse({ priority: priority.trim() }, 'Priority saved', 200));
    } catch (err) {
        next(err);
    }
};

export const generateAiPriority = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;
        if (!user) return next(new UnauthorizedException('Unauthorized', ErrorCodes.UNAUTHORIZED_ACCESS));

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);

       
        const [editorAgg, todayStreak, incompleteGoals, recentActivity] = await Promise.all([
            prisma.editorActivity.aggregate({
                where: { userId: user.id, date: { gte: today, lte: endOfToday } },
                _sum: { duration: true },
            }),
            prisma.streakStats.findUnique({
                where: { userId_date: { userId: user.id, date: today } },
                select: { commitCount: true, hasStreak: true },
            }),
            prisma.goal.findMany({
                where: { userId: user.id, completed: false, period: { in: ['DAILY', 'WEEKLY'] } },
                select: { title: true, type: true, currentValue: true, targetValue: true, unit: true },
                take: 5,
            }),
            prisma.editorActivity.findMany({
                where: { userId: user.id, date: { gte: new Date(Date.now() - 3 * 86400000) } },
                select: { projectName: true, duration: true },
                orderBy: { duration: 'desc' },
                take: 5,
            }),
        ]);

        const codingMins = Math.round((editorAgg._sum.duration ?? 0) / 60);
        const commits = todayStreak?.commitCount ?? 0;
        const goalsCtx = incompleteGoals.map(g => `${g.title} (${g.currentValue}/${g.targetValue} ${g.unit})`).join(', ') || 'No active goals';
        const projectsCtx = recentActivity.map(a => a.projectName).filter(Boolean).join(', ') || 'No recent projects';

        const prompt = `You are a productivity assistant. Write a single concise action-oriented priority sentence (max 12 words) for a developer's day.

Context:
- Developer: ${user.name}
- Coding so far today: ${codingMins} minutes
- Commits pushed today: ${commits}
- Active goals: ${goalsCtx}
- Recent projects: ${projectsCtx}

Rules:
- Start with a strong verb (Ship, Build, Fix, Complete, Push, Finish, Review, etc.)
- Be specific and actionable, not generic
- Max 12 words
- No quotes, no period at end
- Output ONLY the priority sentence, nothing else`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const priority = response.text
            ?.replace(/^["']|["']$/g, '')
            ?.replace(/\.$/, '')
            ?? 'Ship something meaningful today';

        return res.status(200).json(new apiResponse({ priority }, 'AI priority generated', 200));
    } catch (err) {
        next(err);
    }
};
