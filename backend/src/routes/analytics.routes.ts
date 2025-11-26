import { Router } from "express";
import { saveEditorActivity } from "../controllers/analytics/analytics.controller";
import { authMiddleWare } from "../middlewares/auth.middleware";

export const router = Router();

router.post('/editor-activity', saveEditorActivity )