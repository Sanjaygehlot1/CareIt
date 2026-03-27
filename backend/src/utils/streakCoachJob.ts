import cron from 'node-cron';
import { prisma } from '../prisma';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '../secrets';
import { sendRecalibrateEmail, sendLevelUpEmail } from './emailService';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });



const WINDOW_DAYS    = 14;
const COOLDOWN_DAYS  = 14;
const MISS_THRESHOLD = 60;   
const HIT_THRESHOLD  = 85;   
const EXCEED_MULTIPLIER = 1.3; 

type CoachUser = {
    id: number;
    name: string;
    email: string;
    streakCoachAlertedAt: Date | null;
    streakCoachType: string | null;
};

async function analyseUserStreakPattern(userId: number) {
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - WINDOW_DAYS);
    windowStart.setTime(Date.UTC(windowStart.getFullYear(), windowStart.getMonth(), windowStart.getDate()));

    const stats = await prisma.streakStats.findMany({
        where: { userId, date: { gte: windowStart } },
        select: { hasStreak: true, codingDuration: true },
    });

    if (stats.length < 7) return null; 

    const total    = stats.length;
    const hits     = stats.filter(s => s.hasStreak).length;
    const misses   = total - hits;
    const hitRate  = Math.round((hits / total) * 100);
    const missRate = Math.round((misses / total) * 100);
    const avgCodingMins = Math.round(
        stats.reduce((s, r) => s + r.codingDuration, 0) / total / 60
    );

    return { hitRate, missRate, avgCodingMins, total };
}

async function getUserGoals(userId: number) {
    return prisma.goal.findMany({
        where: { userId, completed: false, period: { in: ['WEEKLY', 'DAILY'] } },
        select: { title: true, type: true, targetValue: true, unit: true, period: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
    });
}



async function handleStruggling(user: CoachUser, missRate: number, avgCodingMins: number) {
    const goals = await getUserGoals(user.id);

    const goalsSummary = goals.length > 0
        ? goals.map(g => `${g.title}: ${g.targetValue} ${g.unit} (${g.period})`).join(' · ')
        : 'No active goals set yet.';

    let suggestion = '';
    try {
        const prompt = `You are a compassionate productivity coach.
A developer named ${user.name} has been missing their coding streak ${missRate}% of the time over the past two weeks.
Their average daily coding time is ${avgCodingMins} minutes.
Their current goals: ${goalsSummary}

Write a warm, non-judgmental 2–3 sentence suggestion on how they could recalibrate their goals to be more achievable.
Be specific — e.g. suggest a concrete lower number if their targets seem too high.
Do NOT use bullet points. Respond with plain text only.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        suggestion = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    } catch {
       
        suggestion = `With ${avgCodingMins} minutes of coding per day, consider setting your daily target to ${Math.max(15, Math.round(avgCodingMins * 0.8))} minutes — a threshold you're already nearly hitting. Small, consistent wins build the habit far better than an ambitious target that creates guilt.`;
    }

    await sendRecalibrateEmail(user.email, user.name, missRate, suggestion, goalsSummary);

    await (prisma.user.update as any)({
        where: { id: user.id },
        data: { streakCoachAlertedAt: new Date(), streakCoachType: 'RECALIBRATE' },
    });

    console.log(`[Streak Coach] RECALIBRATE sent to ${user.name} (miss rate: ${missRate}%)`);
}



async function handleExceeding(user: CoachUser, hitRate: number, avgCodingMins: number) {
    const goals = await getUserGoals(user.id);
    const goalsSummary = goals.map(g => `${g.title}: ${g.targetValue} ${g.unit}`).join(', ');

    let newGoals: { title: string; description: string; targetValue: number; unit: string; type: string }[] = [];

    try {
        const prompt = `You are a performance coach for a high-achieving developer.
Name: ${user.name}
Past 14 days:
- Streak hit rate: ${hitRate}%
- Avg daily coding time: ${avgCodingMins} minutes
- Current goals: ${goalsSummary || 'None set'}

Generate exactly 2 new, more challenging WEEKLY goals that will stretch this developer's capabilities.
Goals should be realistic but meaningfully harder than current targets.
Return ONLY valid JSON array — no extra text, no explanation:
[
  { "title": "...", "description": "...", "type": "CODING_TIME|COMMITS|STREAK|CUSTOM", "targetValue": <number>, "unit": "minutes|commits|days|..." },
  { "title": "...", "description": "...", "type": "CODING_TIME|COMMITS|STREAK|CUSTOM", "targetValue": <number>, "unit": "..." }
]`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' },
        });
        const raw = response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        newGoals = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      
        newGoals = [
            {
                title: 'Code 20% longer each day',
                description: `Push your daily average from ${avgCodingMins}m to ${Math.round(avgCodingMins * 1.2)}m`,
                type: 'CODING_TIME',
                targetValue: Math.round(avgCodingMins * 1.2 * 5),
                unit: 'minutes',
            },
            {
                title: 'Maintain a perfect streak this week',
                description: 'Hit your coding target for all 7 days — no exceptions.',
                type: 'STREAK',
                targetValue: 7,
                unit: 'days',
            },
        ];
    }

    if (!Array.isArray(newGoals) || newGoals.length === 0) return;

   
    newGoals = newGoals.slice(0, 3);

  
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setTime(Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate()));

   
    const created = await Promise.all(newGoals.map(g =>
        prisma.goal.create({
            data: {
                userId: user.id,
                title: g.title,
                description: g.description,
                type: (g.type as any) || 'CUSTOM',
                period: 'WEEKLY',
                targetValue: Number(g.targetValue) || 60,
                unit: g.unit || 'minutes',
                isAiGenerated: true,
                weekStart: monday,
            },
        })
    ));

    console.log(`[Streak Coach] Created ${created.length} level-up goals for user ${user.id}`);

    
    await sendLevelUpEmail(
        user.email,
        user.name,
        hitRate,
        avgCodingMins,
        newGoals.map(g => ({
            title: g.title,
            description: g.description,
            targetValue: Number(g.targetValue),
            unit: g.unit,
        })),
    );

    await (prisma.user.update as any)({
        where: { id: user.id },
        data: { streakCoachAlertedAt: new Date(), streakCoachType: 'LEVEL_UP' },
    });

    console.log(`[Streak Coach] LEVEL_UP sent to ${user.name} (hit rate: ${hitRate}%, ${created.length} new goals)`);
}



export function startStreakCoachJob() {
   
    cron.schedule('0 22 * * 0', async () => {
        console.log('[Streak Coach] Running weekly pattern analysis...');

        try {
            const users = await (prisma.user.findMany as any)({
                where: { email: { not: '' }, streakEmailReminder: true },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    streakCoachAlertedAt: true,
                    streakCoachType: true,
                },
            }) as CoachUser[];

            console.log(`[Streak Coach] Analysing ${users.length} users`);

            await Promise.allSettled(users.map(async (user) => {
                try {
                   
                    if (user.streakCoachAlertedAt) {
                        const daysSince = (Date.now() - user.streakCoachAlertedAt.getTime()) / 86400000;
                        if (daysSince < COOLDOWN_DAYS) {
                            return; 
                        }
                    }

                    const pattern = await analyseUserStreakPattern(user.id);
                    if (!pattern) return; 
                    const { hitRate, missRate, avgCodingMins } = pattern;

                    if (missRate >= MISS_THRESHOLD) {
                        
                        await handleStruggling(user, missRate, avgCodingMins);

                    } else if (hitRate >= HIT_THRESHOLD) {
                   
                        const goals = await getUserGoals(user.id);
                        const codingGoal = goals.find(g => g.type === 'CODING_TIME');

                       
                        const dailyGoalMins = codingGoal
                            ? Math.round(codingGoal.targetValue / 7)
                            : 30; 
                        if (avgCodingMins >= dailyGoalMins * EXCEED_MULTIPLIER) {
                            await handleExceeding(user, hitRate, avgCodingMins);
                        }
                        
                    }

                } catch (userErr) {
                    console.error(`[Streak Coach] Failed for user ${user.id}:`, userErr);
                }
            }));

            console.log('[Streak Coach] Weekly analysis complete.');
        } catch (err) {
            console.error('[Streak Coach] Job error:', err);
        }
    }, {
        timezone: "Asia/Kolkata"
    });

    console.log('[Streak Coach] Scheduled — runs every Sunday at 10:00 PM (IST)');
}
