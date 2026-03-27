import cron from 'node-cron';
import { prisma } from '../prisma';
import { sendBurnoutAlertEmail } from './emailService';

type BurnoutLevel = 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE';


const BASELINE_DAYS = 7;     
const RECENT_DAYS   = 7;     
const MIN_DATA_DAYS = 5;    
const EMAIL_COOLDOWN_DAYS = 7;

type BurntUser = {
    id: number;
    name: string;
    email: string;
    burnoutAlertedAt: Date | null;
    burnoutLevel: BurnoutLevel;
};

async function computeBurnoutForUser(userId: number): Promise<{
    level: BurnoutLevel;
    score: number;         
    dropPercent: number;
    baselineAvgMins: number;
    recentAvgMins: number;
} | null> {
    
    const allStats = await prisma.streakStats.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
        select: { date: true, codingDuration: true },
    });

  
    const editorByDay = await prisma.editorActivity.groupBy({
        by: ['date'],
        where: { userId },
        _sum: { duration: true },
        orderBy: { date: 'asc' },
    });

    
    const dayMap = new Map<string, number>();
    for (const s of allStats) {
        const key = s.date.toISOString().split('T')[0];
        dayMap.set(key, s.codingDuration);
    }
    for (const e of editorByDay) {
        const key = e.date.toISOString().split('T')[0];
        const existing = dayMap.get(key) ?? 0;
       
        dayMap.set(key, Math.max(existing, e._sum.duration ?? 0));
    }

    const sortedDays = Array.from(dayMap.entries()).sort(([a], [b]) => a.localeCompare(b));
    if (sortedDays.length < MIN_DATA_DAYS) return null; 
     
    const baselineDays = sortedDays.slice(0, BASELINE_DAYS);
    const baselineAvgSec = baselineDays.reduce((s, [, d]) => s + d, 0) / baselineDays.length;

    
    const recentDays = sortedDays.slice(-RECENT_DAYS);
    const recentAvgSec = recentDays.reduce((s, [, d]) => s + d, 0) / recentDays.length;

    const baselineAvgMins = Math.round(baselineAvgSec / 60);
    const recentAvgMins   = Math.round(recentAvgSec / 60);

   
    if (baselineAvgMins < 5) return null;

    const dropPercent = Math.max(0, Math.round((1 - recentAvgSec / baselineAvgSec) * 100));

    let level: BurnoutLevel;
    if      (dropPercent >= 65) level = 'SEVERE';
    else if (dropPercent >= 45) level = 'MODERATE';
    else if (dropPercent >= 25) level = 'MILD';
    else                        level = 'NONE';

    
    const score = Math.min(100, Math.round((dropPercent / 80) * 100));

    return { level, score, dropPercent, baselineAvgMins, recentAvgMins };
}

export function startBurnoutDetectionJob() {

    cron.schedule('0 8 * * 1', async () => {
        console.log('[Burnout Detection] Running weekly check...');

        try {
            const users = await (prisma.user.findMany as any)({
                where: { email: { not: '' } },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    burnoutAlertedAt: true,
                    burnoutLevel: true,
                },
            }) as BurntUser[];

            console.log(`[Burnout Detection] Checking ${users.length} users`);

            await Promise.allSettled(users.map(async (user) => {
                try {
                    const result = await computeBurnoutForUser(user.id);
                    if (!result) return; // not enough data

                    const { level, score, dropPercent, baselineAvgMins, recentAvgMins } = result;

                    
                    await (prisma.user.update as any)({
                        where: { id: user.id },
                        data: { burnoutScore: score, burnoutLevel: level },
                    });

                  
                    if (level === 'NONE') return;

                    const cooldownPassed = !user.burnoutAlertedAt
                        || (Date.now() - user.burnoutAlertedAt.getTime()) > EMAIL_COOLDOWN_DAYS * 86400 * 1000;

                    if (!cooldownPassed) {
                        console.log(`[Burnout Detection] Skipping email for user ${user.id} (cooldown active)`);
                        return;
                    }

                    await sendBurnoutAlertEmail(
                        user.email,
                        user.name,
                        level as 'MILD' | 'MODERATE' | 'SEVERE',
                        recentAvgMins,
                        baselineAvgMins,
                        dropPercent,
                    );

                    await (prisma.user.update as any)({
                        where: { id: user.id },
                        data: { burnoutAlertedAt: new Date() },
                    });

                    console.log(`[Burnout Detection] ${level} alert sent to user ${user.id} (drop: ${dropPercent}%)`);
                } catch (userErr) {
                    console.error(`[Burnout Detection] Failed for user ${user.id}:`, userErr);
                }
            }));

            console.log('[Burnout Detection] Weekly check complete.');
        } catch (err) {
            console.error('[Burnout Detection] Job error:', err);
        }
    }, {
        timezone: "Asia/Kolkata"
    });

    console.log('[Burnout Detection] Scheduled — runs every Monday at 8:00 AM (IST)');
}

export async function refreshBurnoutScore(userId: number) {
    const result = await computeBurnoutForUser(userId);
    if (!result) return null;

    await (prisma.user.update as any)({
        where: { id: userId },
        data: {
            burnoutScore: result.score,
            burnoutLevel: result.level,
        },
    });

    return result;
}
