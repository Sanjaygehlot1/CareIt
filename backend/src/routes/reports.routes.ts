import {Router} from 'express'
import { getStreak } from '../controllers/reports/reports.controller';
import { authMiddleWare } from '../middlewares/auth.middleware';

export const router = Router();

router.post('/streak-info', authMiddleWare, getStreak)