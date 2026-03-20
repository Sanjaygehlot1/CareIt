import { Router } from 'express';
import { authMiddleWare } from '../middlewares/auth.middleware';
import {
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    generateAiGoals,
} from '../controllers/goals/goals.controller';

export const router = Router();

router.get('/', authMiddleWare, getGoals);
router.post('/', authMiddleWare, createGoal);
router.put('/:id', authMiddleWare, updateGoal);
router.delete('/:id', authMiddleWare, deleteGoal);
router.post('/ai-generate', authMiddleWare, generateAiGoals);
