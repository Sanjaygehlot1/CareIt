import express from 'express';
import type { Express, NextFunction, Request, Response } from 'express'
import { FRONTEND_BASE_URL, PORT, SESSION_SECRET } from './secrets';
import { errorMiddleware } from './middlewares/errors.middleware';
import session from 'express-session'
import passport from '../src/OAuth2Strategy/google'
import cookieParser from 'cookie-parser'
import cors from 'cors'

//Routes
import { router as UserRoutes } from './routes/user.routes';
import { router as CalendarRoutes } from './routes/calendar.routes'
const app: Express = express();

app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: FRONTEND_BASE_URL
}))

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  }
}));

app.use(passport.initialize())
app.use(passport.session())

app.use('/api/v1/auth', UserRoutes);
app.use('/api/v1/calendar', CalendarRoutes);

app.use(errorMiddleware)


app.listen(PORT, () => {
  console.log('Server is running on port 3000')
})