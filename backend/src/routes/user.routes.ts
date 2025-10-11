import { Router } from "express";
import passport from "passport";
import { getProfile, logOut } from "../controllers/users/auth.controller";
import '../OAuth2Strategy/google'
import '../OAuth2Strategy/github'
import { authMiddleWare } from "../middlewares/auth.middleware";
import { FRONTEND_BASE_URL } from "../secrets";
import { prisma } from "../prisma";

export const route: Router = Router();

//Google Routes

route.get('/google/login', (req, res, next) => {
  console.log("\n=== GOOGLE LOGIN INITIATED ===");
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'select_account'
  })(req, res, next);
});

route.get('/google/connect-calendar', authMiddleWare, (req, res, next) => {
  const user = req.user as any;
  const isGoogleUser = user && user.provider === 'google';
  const forceSelect = req.query.force_select === 'true';

  const authOptions: any = {
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar.readonly'
    ],
    accessType: 'offline',
    state: 'calendar_connect'
  };

  if (forceSelect || !isGoogleUser) {
    authOptions.prompt = 'select_account consent';
    console.log("Forcing account selection");
  } else if (isGoogleUser && user.email) {
    authOptions.prompt = 'consent';
    authOptions.loginHint = user.email;
    console.log("Using login hint for Google user");
  }

  passport.authenticate('google', authOptions)(req, res, next);
});


route.post('/check-google-available', authMiddleWare, async (req, res) => {
  try {
    const { googleEmail } = req.body;

    if (!googleEmail) {
      return res.status(400).json({ error: 'Email required' });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: googleEmail, provider: 'google' },
          { googleEmail: googleEmail }
        ]
      }
    });

    return res.json({
      available: !existing,
      message: existing
        ? 'This Google account is already connected to another user'
        : 'This Google account is available'
    });
  } catch (error) {
    return res.status(500).json({ error: 'Check failed' });
  }
});


route.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', {
    failureRedirect: `${FRONTEND_BASE_URL}/sign-in`,
    session: true
  }, (error, user, info) => {

    if (error) {
      if (error.message === 'GOOGLE_ACCOUNT_ALREADY_REGISTERED') {
        const details = error.details || {};

        const errorParams = new URLSearchParams({
          error: 'google_conflict',
          google_email: details.googleEmail || '',
          existing_email: details.existingAccountEmail || '',
          current_provider: details.currentUserProvider || ''
        });

        return res.redirect(`${FRONTEND_BASE_URL}/settings?${errorParams.toString()}`);
      }

      return res.redirect(`${FRONTEND_BASE_URL}/settings?error=calendar_failed`);
    }

    if (!user) {
      return res.redirect(`${FRONTEND_BASE_URL}/sign-in?error=no_user`);
    }

    const isAlreadyLoggedIn = req.isAuthenticated();

    if (isAlreadyLoggedIn && user.calendar) {
      return res.redirect(`${FRONTEND_BASE_URL}/settings?status=calendar-connected`);
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      if (user.calendar) {
        return res.redirect(`${FRONTEND_BASE_URL}/settings?status=calendar-connected`);
      }
      return res.redirect(`${FRONTEND_BASE_URL}/dashboard`);
    });
  })(req, res, next);
});


//Github Routes

route.get('/github/login', (req, res, next) => {
  passport.authenticate('github', {
    scope: ['user:email'],
    state: 'github_login'
  })(req, res, next);
})

route.get('/github/connect', authMiddleWare, (req, res, next) => {

  const user = req.user as any;
  const isGithubUser = user && user.provider === 'github';


  if (isGithubUser) {
    return res.redirect(`${FRONTEND_BASE_URL}/settings?status=github-already-connected`);
  }

  const options : passport.AuthenticateOptions = {
    scope : ['user:email', 'read:user', 'repo'],
    state : 'github_connect'
  }
 

  passport.authenticate('github',options)(req, res, next);
});


route.get('/github/callback', (req, res, next) => {
  console.log("Query params:", req.query);

  passport.authenticate('github', {
    failureRedirect: `${FRONTEND_BASE_URL}/sign-in`,
    session: true
  }, (error: any, user: any, info: any) => {
    console.log("\n=== GITHUB AUTH RESULT ===");
    console.log("Error:", error);
    console.log("User:", user);

    if (error) {
      let errorMessage = 'An unknown error occurred. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }

      const encodedMessage = encodeURIComponent(errorMessage);
      if (error.message && error.message.includes('already connected to another account')) {

        return res.redirect(`${FRONTEND_BASE_URL}/settings?error=github_conflict&message=${encodedMessage}`);
      }

      return res.redirect(`${FRONTEND_BASE_URL}/settings?error=github_conflict&message=${encodedMessage}`);
    }

    if (!user) {
      return res.redirect(`${FRONTEND_BASE_URL}/sign-in?error=github-conflict&message=User not found`);
    }

    const isAlreadyLoggedIn = req.isAuthenticated();
    const state = req.query.state as string;

    if (isAlreadyLoggedIn && state === 'github_connect') {
      console.log("GitHub connected for existing session");
      return res.redirect(`${FRONTEND_BASE_URL}/settings?status=github-connected`);
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }

      console.log("User logged in successfully via GitHub");
      return res.redirect(`${FRONTEND_BASE_URL}/dashboard`);
    });
  })(req, res, next);
});

route.get('/profile', authMiddleWare, getProfile);
route.get('/logout', logOut);