import { Router } from "express";
import passport from "passport";
import { getProfile, signUp } from "../controllers/users/auth.controller";
import '../OAuth2Strategy/google'
import '../OAuth2Strategy/github'
import { authMiddleWare } from "../middlewares/auth.middleware";

export const route : Router =  Router();

route.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

route.get('/google/callback', passport.authenticate('google', {failureRedirect : '/'}), signUp);

route.get('/github', passport.authenticate('github', { scope: ['user:email'] }))

route.get('/github/callback', passport.authenticate('github', {failureRedirect : '/'}), signUp);

route.get('/profile',authMiddleWare, getProfile)


