import {Router} from 'express'
import { getStreak, toggleStreakReminder } from '../controllers/reports/reports.controller';
import { authMiddleWare } from '../middlewares/auth.middleware';

export const router = Router();

router.post('/streak-info', authMiddleWare, getStreak)
router.post('/toggle-streak-reminder', authMiddleWare, toggleStreakReminder)