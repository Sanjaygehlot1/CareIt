import express from 'express';
import type { Express, NextFunction, Request, Response } from 'express'
import { FRONTEND_BASE_URL, PORT, SESSION_SECRET } from './secrets';
import { errorMiddleware } from './middlewares/errors.middleware';
import session from 'express-session'
import passport from '../src/OAuth2Strategy/google'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { router as UserRoutes } from './routes/user.routes';
import { router as CalendarRoutes } from './routes/calendar.routes'
import { router as ReportRoutes } from './routes/reports.routes'
import { router as AnalyticsRoutes } from './routes/analytics.routes'
import { router as GoalRoutes } from './routes/goals.routes'
import { router as NoteRoutes } from './routes/notes.routes'
import { startStreakReminderJob } from './utils/streakReminderJob'
import { startDailyDigestJob } from './utils/dailyDigestJob'
import { startBurnoutDetectionJob } from './utils/burnoutDetectionJob'
import { startStreakCoachJob } from './utils/streakCoachJob'
import pgSession from 'connect-pg-simple';
import { DB_URI } from './secrets';

const app: Express = express();


app.set('trust proxy', 1);

app.use(express.json())
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: FRONTEND_BASE_URL
}))

const PgSessionStore = pgSession(session);

app.use(session({
  store: new PgSessionStore({
    conString: DB_URI,
    createTableIfMissing: true
  }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  }
}));

app.use(passport.initialize())
app.use(passport.session())

app.use('/api/v1/auth', UserRoutes);
app.use('/api/v1/calendar', CalendarRoutes);
app.use('/api/v1/reports', ReportRoutes);
app.use('/api/v1/analytics', AnalyticsRoutes);
app.use('/api/v1/goals', GoalRoutes);
app.use('/api/v1/notes', NoteRoutes);

app.get('/',(req,res)=>{
  res.send("hello")
})

app.use(errorMiddleware)


app.listen(PORT, () => {
  console.log('Server is running on port 3000')

  startStreakReminderJob();
  startDailyDigestJob();
  startBurnoutDetectionJob();
  startStreakCoachJob();
})