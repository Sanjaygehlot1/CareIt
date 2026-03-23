import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException } from '../../exceptions/errorExceptions';
import { ErrorCodes } from '../../exceptions/root';
import { prisma } from "../../prisma";
import { apiResponse } from '../../utils/apiResponse';
import { google } from 'googleapis';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, GEMINI_API_KEY } from '../../secrets';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });


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
                streakUpdatedAt: true,
                streakEmailReminder: true
            }
        });

        if (!userStreak) {
            return res.status(404).json(new apiResponse({}, "User not found", 404));
        }

        
        const weekStatus = await getWeekStatus(user.id);

        const today = new Date();
        today.setTime(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);

        const STREAK_THRESHOLD = 30 * 60;

        const [editorAgg, todayStreakRow] = await Promise.all([
            prisma.editorActivity.aggregate({
                where: { userId: user.id, date: { gte: today, lte: endOfToday } },
                _sum: { duration: true },
            }),
            prisma.streakStats.findUnique({
                where: { userId_date: { userId: user.id, date: today } },
                select: { commitCount: true },
            }),
        ]);

        const todayCodingDuration = editorAgg._sum.duration ?? 0;
        const todayCommits = todayStreakRow?.commitCount ?? 0;

        const now = new Date();
        const lastUpdate = userStreak.streakUpdatedAt;
        const cacheAge = lastUpdate ? now.getTime() - lastUpdate.getTime() : Infinity;
        const ONE_HOUR = 60 * 60 * 1000;

        const streakProgress = {
            todayCodingDuration,
            todayCommits,
            streakThreshold: STREAK_THRESHOLD,
            hasStreak: todayCodingDuration >= STREAK_THRESHOLD,
        };

        const isSameDay = lastUpdate && 
            lastUpdate.getFullYear() === now.getFullYear() &&
            lastUpdate.getMonth() === now.getMonth() &&
            lastUpdate.getDate() === now.getDate();

        if (cacheAge < ONE_HOUR && isSameDay) {
            return res.status(200).json(new apiResponse({
                currentStreak: userStreak.currentStreak,
                longestStreak: userStreak.longestStreak,
                weekStatus,
                streakProgress,
                streakEmailReminder: userStreak.streakEmailReminder
            }, "Streak retrieved", 200));
        }

       
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
            weekStatus,
            streakProgress,
            streakEmailReminder: userStreak.streakEmailReminder
        }, "Streak recalculated", 200));

    } catch (error) {
        console.log(error);
        next(error);
    }
};

async function getWeekStatus(userId: number): Promise<boolean[]> {
    const today = new Date();
    today.setTime(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

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
            streakDate.setTime(Date.UTC(streakDate.getFullYear(), streakDate.getMonth(), streakDate.getDate()));
            return streakDate.getTime() === dateTime;
        });
        return streak?.hasStreak || false;
    });

    return weekStatus; 
}

async function recalculateStreak(userId: number) {
    const today = new Date();
    today.setTime(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
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
        date.setTime(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        return date.getTime();
    });
    const oneDayMs = 24 * 60 * 60 * 1000;

    
    let currentStreak = 0;
    const mostRecentDate = dates[0];
    
    if (mostRecentDate >= yesterday.getTime()) {
        let checkDate = mostRecentDate;
        
        for (const date of dates) {
            const diffDays = Math.round(Math.abs(date - checkDate) / oneDayMs);
            if (diffDays === 0) {
                currentStreak++;
               
                const nextCheck = new Date(checkDate);
                nextCheck.setDate(nextCheck.getDate() - 1);
                nextCheck.setTime(Date.UTC(nextCheck.getFullYear(), nextCheck.getMonth(), nextCheck.getDate()));
                checkDate = nextCheck.getTime();
            } else if (date < checkDate) {
                break;
            }
        }
    }

    
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < dates.length; i++) {
        const diffDays = Math.round(Math.abs(dates[i - 1] - dates[i]) / oneDayMs);
        
        if (diffDays === 1) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else if (diffDays > 1) {
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


export const toggleStreakReminder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;

        if (!user) {
            return next(new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED_ACCESS));
        }

        const { enabled } = req.body;

        if (typeof enabled !== 'boolean') {
            return res.status(400).json(new apiResponse({}, "Invalid value for 'enabled'", 400));
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { streakEmailReminder: enabled }
        });

        return res.status(200).json(new apiResponse(
            { streakEmailReminder: enabled },
            `Streak email reminders ${enabled ? 'enabled' : 'disabled'}`,
            200
        ));
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const getAdvancedReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;
        if (!user) return next(new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED_ACCESS));

        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setDate(today.getDate() - 90);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);

        const focusStats = await prisma.focusStats.findMany({
            where: { userId: user.id, date: { gte: thirtyDaysAgo } }
        });

        const streakStats = await prisma.streakStats.findMany({
            where: { userId: user.id, date: { gte: threeMonthsAgo } }
        });

        let focusTime7d = 0;
        let codingTime7d = 0;

        focusStats.filter(f => new Date(f.date) >= sevenDaysAgo).forEach(f => focusTime7d += f.duration);
        streakStats.filter(s => new Date(s.date) >= sevenDaysAgo).forEach(s => codingTime7d += s.codingDuration);

        const focusHours = focusTime7d / 3600;
        let codingHours = codingTime7d / 3600;
        
        if (codingHours < focusHours) codingHours = focusHours;
        const generalCodingHours = codingHours - focusHours;

        let meetingHours = 0;
        if (user.googleRefreshToken) {
            try {
                const OAuth2 = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL);
                OAuth2.setCredentials({ refresh_token: user.googleRefreshToken });
                const calendar = google.calendar({ version: 'v3', auth: OAuth2 });

                const eventsRes = await calendar.events.list({
                    calendarId: 'primary',
                    timeMin: sevenDaysAgo.toISOString(),
                    timeMax: today.toISOString(),
                    singleEvents: true,
                    maxResults: 250,
                    fields: 'items(start,end,summary,hangoutLink,conferenceData,location,attendees)'
                });

                const events = eventsRes.data.items ?? [];
                
                const meetings = events.filter(ev => {
                    const hasConferenceData = !!ev.hangoutLink || !!ev.conferenceData;
                    const textSearch = `${ev.location || ''} ${ev.summary || ''}`.toLowerCase();
                    const hasExternalMeetingLink = textSearch.includes('zoom.us') || textSearch.includes('teams.microsoft') || textSearch.includes('webex.com');
                    const hasMultipleAttendees = ev.attendees && ev.attendees.length > 1;
                    return hasConferenceData || hasExternalMeetingLink || hasMultipleAttendees;
                });

                meetingHours = meetings.reduce((sum, ev) => {
                    const start = ev.start?.dateTime ? new Date(ev.start.dateTime) : null;
                    const end = ev.end?.dateTime ? new Date(ev.end.dateTime) : null;
                    if (start && end) {
                        return sum + (end.getTime() - start.getTime()) / 3600000;
                    }
                    return sum;
                }, 0);
            } catch (err) {
                console.error("Google Calendar fetch failed for advanced reports:", err);
            }
        }

        const daySums = [0, 0, 0, 0, 0, 0, 0];
        focusStats.forEach(f => {
            const dayOfWeek = new Date(f.date).getDay();
            daySums[dayOfWeek] += f.duration / 60;
        });
        
        streakStats.filter(s => new Date(s.date) >= thirtyDaysAgo).forEach(s => {
            const dayOfWeek = new Date(s.date).getDay();
            daySums[dayOfWeek] += s.codingDuration / 60;
        });

        const daysOfWeekList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const productivityByDay = daysOfWeekList.map((day, idx) => ({
            name: day.substring(0, 3), 
            value: Math.round(daySums[idx] / 4)
        }));

        const timeAllocation = [
            { name: 'Deep Work', value: Math.round(focusHours * 10) / 10, color: '#f97316' },
            { name: 'General Coding', value: Math.round(generalCodingHours * 10) / 10, color: '#8b5cf6' },
            { name: 'Meetings', value: Math.round(meetingHours * 10) / 10, color: '#ef4444' }
        ].filter(item => item.value > 0);

        const projectActivity = await prisma.editorActivity.groupBy({
            by: ['projectName'],
            where: { userId: user.id, date: { gte: thirtyDaysAgo } },
            _sum: { duration: true },
            orderBy: { _sum: { duration: 'desc' } },
            take: 5
        });

        const projectBreakdown = projectActivity.map(p => ({
            name: p.projectName || 'Unnamed Project',
            value: Math.round((p._sum.duration || 0) / 3600 * 10) / 10
        }));

        let githubHeatmap = [];
        if (user.githubAccessToken && user.githubUsername) {
            try {
                const gqlResponse = await fetch('https://api.github.com/graphql', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${user.githubAccessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: `
                            query($username: String!) {
                                user(login: $username) {
                                    contributionsCollection {
                                        contributionCalendar {
                                            weeks {
                                                contributionDays {
                                                    contributionCount
                                                    date
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        `,
                        variables: { username: user.githubUsername }
                    })
                });

                const gqlData: any = await gqlResponse.json();
                const weeks = gqlData?.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];
                
                githubHeatmap = weeks.flatMap((w: any) => w.contributionDays).map((d: any) => ({
                    date: d.date,
                    count: d.contributionCount
                })).slice(-90);

            } catch (err) {
                console.error("GitHub Heatmap fetch failed:", err);
            }
        }

        const activityHeatmap = githubHeatmap.length > 0 ? githubHeatmap : streakStats.map(s => ({
            date: s.date.toISOString().split('T')[0],
            count: s.hasStreak ? 1 : 0
        }));

        return res.status(200).json(new apiResponse({
            timeAllocation,
            productivityByDay,
            projectBreakdown,
            activityHeatmap: {
                data: activityHeatmap,
                source: githubHeatmap.length > 0 ? 'github' : 'local'
            }
        }, "Advanced reports generated", 200));

    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const getAiCoachSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;
        if (!user) return next(new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED_ACCESS));

        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const [focusStats, streakStats, userRecord] = await Promise.all([
            prisma.focusStats.findMany({ where: { userId: user.id, date: { gte: sevenDaysAgo } } }),
            prisma.streakStats.findMany({ where: { userId: user.id, date: { gte: sevenDaysAgo } } }),
            prisma.user.findUnique({ where: { id: user.id }, select: { burnoutScore: true, name: true } })
        ]);

        const totalFocusHrs = focusStats.reduce((s, f) => s + f.duration, 0) / 3600;
        const totalCodingHrs = streakStats.reduce((s, st) => s + st.codingDuration, 0) / 3600;
        const totalCommits = streakStats.reduce((s, st) => s + st.commitCount, 0);
        const burnout = userRecord?.burnoutScore ?? 0;

        const prompt = `Act as a sharp, observant engineering coach.
Analyze the developer's last 7 days of activity and provide a punchy 2-sentence insight.

Performance Data:
- Developer: ${userRecord?.name}
- Deep Work (Focus): ${totalFocusHrs.toFixed(1)} hrs
- Total Coding: ${totalCodingHrs.toFixed(1)} hrs
- Total Commits: ${totalCommits}
- Burnout Risk Score: ${burnout}/100

Directives:
1. Sentence 1: Hard, specific praise on a strong metric.
2. Sentence 2: Actionable advice or a gentle warning targeting the weakest metric (e.g., high burnout, low focus).
3. Be brutally concise. Strictly maximum 35 words.
4. No quotes, no intro, no emojis. Output ONLY the 2 sentences.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const summary = response.text || "You're making steady progress. Keep up the deep work sessions to hit your peak flow!";

        return res.status(200).json(new apiResponse({ summary }, "AI Coach summary generated", 200));

    } catch (error) {
        console.error("AI Coach Error:", error);
        next(error);
    }
};