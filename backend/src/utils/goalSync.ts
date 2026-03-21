import { prisma } from '../prisma';



export function getWeekStart(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = today.getDay();
    const offset = day === 0 ? -6 : 1 - day;
    today.setDate(today.getDate() + offset);
    return today;
}

export function getMonthStart(): Date {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
}

export async function syncOneGoal(goal: any, userId: number): Promise<any> {
    const now = new Date();

    const periodStart = goal.period === 'DAILY'
        ? (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })()
        : goal.period === 'MONTHLY'
            ? getMonthStart()
            : getWeekStart();

    const goalCreated = new Date(goal.createdAt);
    goalCreated.setHours(0, 0, 0, 0);
    const trackFrom = goalCreated > periodStart ? goalCreated : periodStart;


    const SYSTEM_TRACKED_TYPES = ['CODING_TIME', 'STREAK', 'COMMITS', 'FOCUS_TIME'] as const;
    if (!(SYSTEM_TRACKED_TYPES as readonly string[]).includes(goal.type)) {
        return goal;
    }

    console.log(`[GoalSync] #${goal.id} ${goal.type} | trackFrom=${trackFrom.toISOString()} | period=${goal.period}`);

    let currentValue: number = goal.currentValue ?? 0;

    try {
        if (goal.type === 'CODING_TIME') {
            const stats = await prisma.streakStats.aggregate({
                where: { userId, date: { gte: trackFrom, lte: now } },
                _sum: { codingDuration: true }
            });
            currentValue = Math.round((stats._sum.codingDuration ?? 0) / 60);

        } else if (goal.type === 'STREAK') {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { currentStreak: true }
            });
            currentValue = user?.currentStreak ?? 0;

        } else if (goal.type === 'FOCUS_TIME') {
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            const stats = await prisma.focusStats.aggregate({
                where: { userId, date: { gte: trackFrom, lte: endOfDay } },
                _sum: { duration: true }
            });
            currentValue = Math.round((stats._sum.duration ?? 0) / 60);

        } else if (goal.type === 'COMMITS') {
            try {
                const stats = await prisma.streakStats.aggregate({
                    where: { userId, date: { gte: trackFrom, lte: now } },
                    _sum: { commitCount: true }
                });
                currentValue = stats._sum?.commitCount ?? 0;
            } catch {
                currentValue = goal.currentValue ?? 0;
            }
        }

        let effectiveTarget = goal.targetValue;
        if (goal.unit === 'weeks' && goal.type === 'STREAK') {
             effectiveTarget = goal.targetValue * 7;
        }

        const isTimeType = goal.type === 'CODING_TIME' || goal.type === 'FOCUS_TIME';
        const isHours = goal.unit === 'hours';
        
        let completed = false;
        if (isTimeType && isHours) {
            completed = currentValue >= (goal.targetValue * 60);
        } else {
            completed = currentValue >= effectiveTarget;
        }

        console.log(`[GoalSync] #${goal.id} ${goal.type} → currentValue=${currentValue}, target=${goal.targetValue} ${goal.unit}, completed=${completed}`);

        if (currentValue !== goal.currentValue || completed !== goal.completed) {
            return await prisma.goal.update({
                where: { id: goal.id },
                data: { currentValue, completed }
            });
        }
    } catch (err) {
        console.error(`[GoalSync] Failed to sync goal #${goal.id}:`, err);
    }

    return goal;
}


export function triggerGoalSync(userId: number, types: Array<'CODING_TIME' | 'STREAK' | 'COMMITS' | 'FOCUS_TIME'>) {
   
    setImmediate(async () => {
        try {
            const goals = await prisma.goal.findMany({
                where: {
                    userId,
                    completed: false,
                    type: { in: types }
                }
            });

            if (goals.length === 0) return;

            await Promise.allSettled(goals.map(g => syncOneGoal(g, userId)));

            console.log(`[GoalSync] Synced ${goals.length} goal(s) for user #${userId} (types: ${types.join(', ')})`);
        } catch (err) {
            console.error(`[GoalSync] Batch sync failed for user #${userId}:`, err);
        }
    });
}
