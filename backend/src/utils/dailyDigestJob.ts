import cron from 'node-cron';
import { prisma } from '../prisma';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '../secrets';
import { sendDailyDigestEmail } from './emailService';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export function startDailyDigestJob() {
    cron.schedule('0 21 * * *', async () => {
        console.log('[Daily Digest] Running...');

        try {
            const today = new Date();
            today.setTime(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
            const now = new Date();

            const users = await (prisma.user.findMany as any)({
                where: {
                    dailyDigestEnabled: true,
                    email: { not: '' },
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    currentStreak: true,
                    longestStreak: true,
                },
            });

            console.log(`[Daily Digest] Processing ${users.length} users`);

            await Promise.allSettled(users.map(async (user: { id: number; name: string; email: string; currentStreak: number; longestStreak: number }) => {
                try {
                    
                    const todayStreakStat = await prisma.streakStats.findUnique({
                        where: { userId_date: { userId: user.id, date: today } },
                        select: { codingDuration: true, hasStreak: true, commitCount: true },
                    });

                   
                    const editorSum = await prisma.editorActivity.aggregate({
                        where: { userId: user.id, date: { gte: today, lte: now } },
                        _sum: { duration: true },
                    });

                    const codingSeconds = editorSum._sum.duration ?? todayStreakStat?.codingDuration ?? 0;
                    const codingMins = Math.round(codingSeconds / 60);
                    const commits = todayStreakStat?.commitCount ?? 0;
                    const hasStreak = todayStreakStat?.hasStreak ?? false;

                   
                    const goalsCompleted = await prisma.goal.count({
                        where: {
                            userId: user.id,
                            completed: true,
                            period: 'DAILY',
                        },
                    });

                    const totalDailyGoals = await prisma.goal.count({
                        where: { userId: user.id, period: 'DAILY' },
                    });

                    const streakStatus: 'maintained' | 'extended' | 'missed' =
                        !hasStreak ? 'missed'
                            : user.currentStreak > 1 ? 'extended'
                                : 'maintained';

                    
                    let line1 = '';
                    let line2 = '';

                    try {
                        const prompt = `Act as a supportive, articulate engineering coach writing a daily brief for a developer named ${user.name}.

Today's Performance Data:
- Time Spent Coding: ${codingMins} minutes
- Code Commits: ${commits}
- Active Streak: ${hasStreak ? `Extended to ${user.currentStreak} days` : 'Lost today'}
- Daily Goals Hit: ${goalsCompleted} out of ${totalDailyGoals}

Directives:
1. Sentence 1: A warm, fact-based wrap-up emphasizing their specific accomplishments.
2. Sentence 2: A short, motivating, forward-looking thought for tomorrow.
3. Be purely human and encouraging. Avoid robotic language completely. Max 20 words per sentence.

Output STRICTLY as a raw JSON format (no markdown blocks, no extra text):
{
  "line1": "Great focus today with ${codingMins} minutes spent coding and ${commits} commits under your belt!",
  "line2": "Rest your eyes tonight and get ready to tackle those remaining goals tomorrow."
}`;

                        const response = await ai.models.generateContent({
                            model: 'gemini-2.0-flash',
                            contents: [{ role: 'user', parts: [{ text: prompt }] }],
                            config: { responseMimeType: 'application/json' },
                        });

                        const raw = response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
                        const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
                        line1 = parsed.line1 ?? '';
                        line2 = parsed.line2 ?? '';
                    } catch (aiErr) {
                       
                        console.warn(`[Daily Digest] AI unavailable for user ${user.id}, using template`);
                        line1 = codingMins > 0
                            ? `You coded for ${codingMins} minutes today${commits > 0 ? ` and pushed ${commits} commit${commits > 1 ? 's' : ''}` : ''}.`
                            : 'Today was a lighter day on the code front.';
                        line2 = hasStreak
                            ? `Your ${user.currentStreak}-day streak is intact — come back tomorrow to keep the momentum! 🚀`
                            : 'Every day is a fresh start — see you tomorrow 💪';
                    }

                    
                    if (line1 && line2 && user.email) {
                        await sendDailyDigestEmail(
                            user.email,
                            user.name,
                            line1,
                            line2,
                            codingMins,
                            streakStatus,
                            user.currentStreak,
                        );
                    }
                } catch (userErr) {
                    console.error(`[Daily Digest] Failed for user ${user.id}:`, userErr);
                }
            }));

            console.log('[Daily Digest] Done.');
        } catch (err) {
            console.error('[Daily Digest] Job error:', err);
        }
    }, {
        timezone: "Asia/Kolkata"
    });

    console.log('[Daily Digest] Scheduled — runs daily at 9:00 PM (IST)');
}
