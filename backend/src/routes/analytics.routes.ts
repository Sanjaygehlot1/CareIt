import { Router } from "express";
import { getEditorStats, saveEditorActivity } from "../controllers/analytics/analytics.controller";
import { getDailyFocusStats, getTodayPriority, setTodayPriority, generateAiPriority } from "../controllers/analytics/dailyFocus.controller";
import { authMiddleWare } from "../middlewares/auth.middleware";
import { prisma } from "../prisma";
import { apiResponse } from "../utils/apiResponse";
import { triggerGoalSync } from "../utils/goalSync";

export const router = Router();

router.post('/editor-activity', saveEditorActivity);
router.get('/get-editor-analytics', authMiddleWare, getEditorStats);
router.get('/daily-focus-stats', authMiddleWare, getDailyFocusStats);
router.get('/priority', authMiddleWare, getTodayPriority);
router.post('/priority', authMiddleWare, setTodayPriority);
router.post('/priority/ai', authMiddleWare, generateAiPriority);


router.post('/focus-session', authMiddleWare, async (req, res, next) => {
    try {
        const user = req.user as any;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { durationSeconds } = req.body;
        const duration = Number(durationSeconds);

       
        if (!duration || duration < 60) {
            return res.status(200).json(new apiResponse({}, 'Session too short, not saved', 200));
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

       
        const existing = await prisma.focusStats.findUnique({
            where: { userId_date: { userId: user.id, date: today } },
        });

        if (existing) {
            await prisma.focusStats.update({
                where: { userId_date: { userId: user.id, date: today } },
                data: { duration: { increment: duration } },
            });
        } else {
            await prisma.focusStats.create({
                data: { userId: user.id, date: today, duration },
            });
        }

       
        triggerGoalSync(user.id, ['FOCUS_TIME']);

        const savedMins = Math.round(duration / 60);
        return res.status(200).json(new apiResponse({ savedMins }, `Focus session saved (${savedMins}m)`, 200));
    } catch (err) {
        next(err);
    }
});