import { Router } from 'express';
import { authMiddleWare } from '../middlewares/auth.middleware';
import { getDashboardSummary } from '../controllers/dashboard/dashboard.controller';

export const router = Router();

router.get('/summary', authMiddleWare, getDashboardSummary);
