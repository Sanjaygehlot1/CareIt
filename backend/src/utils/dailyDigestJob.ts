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
            today.setHours(0, 0, 0, 0);
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
                        const prompt = `You are writing a warm, personal 2-sentence daily summary for a developer named ${user.name}.

Data for today:
- Coding time: ${codingMins} minutes
- Commits pushed: ${commits}
- Streak: ${hasStreak ? `maintained at ${user.currentStreak} days` : 'not maintained today'}
- Daily goals completed: ${goalsCompleted} of ${totalDailyGoals}

Write EXACTLY 2 sentences. First sentence = what they accomplished (fact-based, warm). Second sentence = a short motivating or reflective thought for tomorrow. 
Keep it human, never robotic. Max 20 words per sentence.
Respond ONLY with valid JSON: {"line1": "...", "line2": "..."}`;

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
    });

    console.log('[Daily Digest] Scheduled — runs daily at 9:00 PM');
}
