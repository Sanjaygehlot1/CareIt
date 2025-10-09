import { Router } from "express";
import passport from "passport";
import { getProfile, logOut } from "../controllers/users/auth.controller";
import '../OAuth2Strategy/google'
import '../OAuth2Strategy/github'
import { authMiddleWare } from "../middlewares/auth.middleware";
import { FRONTEND_BASE_URL } from "../secrets";

export const route : Router =  Router();

route.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

route.get('/google/callback', passport.authenticate('google', {failureRedirect : '/', session : true}),(req,res)=>{
    res.redirect(`${FRONTEND_BASE_URL}/dashboard`)
});

route.get('/github', passport.authenticate('github', { scope: ['user:email'] }))

route.get('/github/callback', passport.authenticate('github', {failureRedirect : '/', session : true}),(req,res)=>{
    res.redirect(`${FRONTEND_BASE_URL}/dashboard`)
});

route.get('/profile', getProfile)

route.get('/logout', logOut)

