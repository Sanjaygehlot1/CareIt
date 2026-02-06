import { Router } from "express";
import passport from "passport";
import { getProfile, logOut } from "../controllers/users/auth.controller";
import '../OAuth2Strategy/google'
import '../OAuth2Strategy/github'
import { authMiddleWare } from "../middlewares/auth.middleware";
import { FRONTEND_BASE_URL } from "../secrets";
import { prisma } from "../prisma";
import { generateApiKey, getApiKey } from "../controllers/users/apikey.controller";
import { apiResponse } from "../utils/apiResponse";
import { formatDate } from "../utils/formatDate";

export const router: Router = Router();

//Google Routes

router.get('/google/login', (req, res, next) => {
  console.log("\n=== GOOGLE LOGIN INITIATED ===");
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'select_account'
  })(req, res, next);
});

router.get('/google/connect-calendar', authMiddleWare, (req, res, next) => {
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


router.post('/check-google-available', authMiddleWare, async (req, res) => {
  try {
    const { googleEmail } = req.body;

    if (!googleEmail) {
      return res.status(400).json({ error: 'Email required' });
    }

    const existing = await prisma.user.findFirst({
      where: { email: googleEmail, provider: 'google' },
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


router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', {
    failureRedirect: `${FRONTEND_BASE_URL}/sign-in`,
    session: true
  }, (error, user, info) => {

    const scope = req.query.state as string;

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

      if (user.calendar && scope == 'calendar_connect') {
        return res.redirect(`${FRONTEND_BASE_URL}/settings?status=calendar-connected`);
      }
      return res.redirect(`${FRONTEND_BASE_URL}/dashboard`);
    });
  })(req, res, next);
});


//Github Routes

router.get('/github/login', (req, res, next) => {
  passport.authenticate('github', {
    scope: ['user:email'],
    state: 'github_login'
  })(req, res, next);
})

router.get('/github/connect', authMiddleWare, (req, res, next) => {

  const user = req.user as any;
  const isGithubUser = user && user.provider === 'github';


  if (isGithubUser) {
    return res.redirect(`${FRONTEND_BASE_URL}/settings?status=github-already-connected`);
  }

  const options: passport.AuthenticateOptions = {
    scope: ['user:email', 'read:user', 'repo'],
    state: 'github_connect'
  }


  passport.authenticate('github', options)(req, res, next);
});

router.get('/github/callback', (req, res, next) => {
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

router.post('/github/webhooks/github-app', async (req, res, next) => {

  try {
    const event = req.headers['x-github-event'] as string;

    if (event == 'installation' && req.body.action == "created") {
      const { installation, sender, repositories } = req.body;

      console.log(`🎉 Installation Event Received!`);
      console.log(`User: ${sender.login}`);
      console.log(`Installation ID: ${installation.id}`);
      console.log(`Repos: ${repositories?.length || 'All'}`);

      await prisma.user.updateMany({
        where: { githubUsername: sender.login },
        data: {
          githubAppInstallationId: installation.id,
          githubAppInstalled: true

        }
      })

      console.log(`User ${sender.login} - App installed successfully!`);

      return res.status(200).json(new apiResponse({},
        "CareIt github App installation successful",
        200));

    }

    if (event === 'push') {
      const { pusher, commits, repository, sender } = req.body;

      const commitCount = commits.length;
      const username = sender.login;

      console.log(`📩 ${username} pushed ${commitCount} commits to ${repository.name}`);

      const user = await prisma.user.findFirst({
        where: {
          githubUsername: username,
        }
      });

      if (!user) {
        console.log(`User not found: ${username}`);
        throw new Error("User not in system")
      }

      

      const today = formatDate(new Date());


      const commitDates = commits.map((c: any) => new Date(c.timestamp));
      const hasTodayCommits = commitDates.some((d: Date) => formatDate(d) === today);
      console.log(today)
      console.log(commitDates)
      console.log(hasTodayCommits)
      if (!hasTodayCommits) {
        return res.status(200).json({ message: 'Old commits, skipped' });
      }


      function formatDateDB(date: string): string {
        const [day, month, year] = date.split('-');
        return `${year}-${month}-${day}`;
      }

      const existingRecord = await prisma.streakStats.findUnique({
        where: { userId_date: { userId: user.id, date: new Date(formatDateDB(today)) }, hasStreak: true }
      });
      console.log(existingRecord)

      if (!existingRecord) {
        await prisma.streakStats.create({
          data: {
            userId: user.id,
            date: new Date(formatDateDB(today)),
            hasStreak: true,
          }
        });

        const userStats = await prisma.user.findUnique({
          where: { id: user.id },
          select: { longestStreak: true, currentStreak: true }
        });

        console.log(userStats)

        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            currentStreak: userStats?.currentStreak! + 1,
            longestStreak: Math.max(userStats?.longestStreak || 0, userStats?.currentStreak! + 1)
          }
        });

        return res.status(200).json(new apiResponse({
          currentStreak: updatedUser.currentStreak!
        },
          "Yayy!! Streak maintained : A commit was made just now",
          200));
      }

      return res.status(200).json(new apiResponse({},
        "Streak already marked as done!",
        200));

    }

    if (event === 'installation' && req.body.action === 'deleted') {
      const { installation } = req.body;

      await prisma.user.updateMany({
        where: { githubAppInstallationId: installation.id },
        data: {
          githubAppInstalled: false,
          githubAppInstallationId: null
        }
      });

      console.log(`App uninstalled`);
      res.status(200).json(new apiResponse({},
        "CareIt Github App uninstalled!",
        200));
    }

  } catch (error) {
    next(error)
  }

})

router.get('/profile', authMiddleWare, getProfile);
router.get('/logout', logOut);
router.get('/generate-api-key', authMiddleWare, generateApiKey);
router.get('/get-api-key', authMiddleWare, getApiKey);