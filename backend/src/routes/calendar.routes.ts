import { Router } from "express";
import { authMiddleWare } from "../middlewares/auth.middleware";
import { getCalendarEvents } from "../controllers/calendar/calendar.controller";

export const router = Router();

router.get('/get-events', authMiddleWare, getCalendarEvents);



