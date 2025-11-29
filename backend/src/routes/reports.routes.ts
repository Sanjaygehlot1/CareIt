import {Router} from 'express'
import { calculateFocusPoints, getStreakInfo } from '../controllers/reports/reports.controller';
import { authMiddleWare } from '../middlewares/auth.middleware';

export const router = Router();

router.get('/focus-points', authMiddleWare,calculateFocusPoints)
router.post('/streak-info', authMiddleWare,getStreakInfo)