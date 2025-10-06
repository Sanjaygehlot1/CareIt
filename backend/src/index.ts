import express from 'express';
import type { Express, NextFunction, Request, Response } from 'express'
import {PORT, SESSION_SECRET } from './secrets';
import { errorMiddleware } from './middlewares/errors.middleware';
import session from 'express-session'
import passport from '../src/OAuth2Strategy/google'
import { route as UserRoutes } from './routes/user.routes';
import cookieParser from 'cookie-parser'

const app: Express = express();

app.use(cookieParser());

app.use(session({ secret: SESSION_SECRET, name: "careForIt", resave: false, saveUninitialized: false }))

app.use(passport.session())

app.use('/auth', UserRoutes);

app.use(errorMiddleware)


app.listen(PORT, () => {
    console.log('Server is running on port 3000')
})