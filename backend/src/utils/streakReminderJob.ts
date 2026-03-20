import cron from 'node-cron';
import { prisma } from '../prisma';
import { sendStreakReminderEmail } from './emailService';

export function startStreakReminderJob() {

    cron.schedule('0 18 * * *', async () => {
        console.log('[Streak Reminder Job] Running daily streak check...');

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            
            const usersAtRisk = await prisma.user.findMany({
                where: {
                    currentStreak: { gt: 0 },
                    streakEmailReminder: true,
                    email: { not: '' },
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    currentStreak: true,
                },
            });

            if (usersAtRisk.length === 0) {
                console.log('[Streak Reminder Job] No users at risk. Done.');
                return;
            }

           
            for (const user of usersAtRisk) {
                const todayStreak = await prisma.streakStats.findUnique({
                    where: {
                        userId_date: { userId: user.id, date: today },
                    },
                    select: { hasStreak: true },
                });

              
                if (!todayStreak?.hasStreak) {
                    
                    const now = new Date();
                    const endOfDay = new Date(now);
                    endOfDay.setHours(23, 59, 59, 999);
                    const hoursLeft = Math.round((endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60));

                    await sendStreakReminderEmail(
                        user.email,
                        user.name,
                        user.currentStreak,
                        hoursLeft
                    );
                }
            }

            console.log('[Streak Reminder Job] Completed.');
        } catch (error) {
            console.error('[Streak Reminder Job] Error:', error);
        }
    });

    console.log('[Streak Reminder Job] Scheduled — runs daily at 6:00 PM');
}
