import { Request, Response, NextFunction } from "express"
import { UnauthorizedException } from "../../exceptions/errorExceptions";
import { ErrorCodes } from "../../exceptions/root";
import { apiResponse } from "../../utils/apiResponse";

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const user = req.user as any

    if (!user) {
      return next(new UnauthorizedException("You must be logged in. please login and try again", ErrorCodes.UNAUTHORIZED_ACCESS));
    }

    const safeUserObj = {
      name: user.name,
      email:  user.googleEmail || user.email,
      profileUrl: user.profileUrl,
      calendar : user.calendar,
      id : user.providerId,
      provider : user.provider,
      githubUsername : user.githubUsername,
      githubAppConnected : user.githubAppInstalled,
      burnoutScore : user.burnoutScore ?? 0,
      burnoutLevel : user.burnoutLevel ?? 'NONE',
      dailyDigestEnabled : user.dailyDigestEnabled ?? true,
    }

    res.status(200).json(new apiResponse(
      safeUserObj,
      "user found",
      200
    ))

  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const logOut = async (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Session could not be destroyed.', err);
        return res.status(500).send('Could not log out.');
      }

      res.clearCookie('connect.sid');

      return res.status(200).send('Logged out successfully.');
    });
  });
}

import { prisma } from "../../prisma";
import { sendGoodbyeEmail } from "../../utils/emailService";

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const userEmail = user.googleEmail || user.email;
    const userName = user.name;

 
    if (user.googleRefreshToken || user.googleAccessToken) {
      const tokenToRevoke = user.googleRefreshToken || user.googleAccessToken;
      try {
        const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${tokenToRevoke}`, { method: 'POST' });
        if (response.ok) {
            console.log("[Delete Account] Successfully revoked Google OAuth token.");
        } else {
            console.warn("[Delete Account] Failed to revoke Google token, status:", response.status);
        }
      } catch (err: any) {
        console.warn("[Delete Account] Failed to revoke Google token HTTP error:", err.message);
      }
    }

 
    await prisma.$transaction([
      prisma.editorActivity.deleteMany({ where: { userId: user.id } }),
      prisma.focusStats.deleteMany({ where: { userId: user.id } }),
      prisma.streakStats.deleteMany({ where: { userId: user.id } }),
      prisma.goal.deleteMany({ where: { userId: user.id } }),
      prisma.note.deleteMany({ where: { userId: user.id } }),
      prisma.user.delete({ where: { id: user.id } })
    ]);

    if (userEmail) {

        sendGoodbyeEmail(userEmail, userName).catch(console.error);
    }

    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) {
            console.error('Session could not be destroyed during account deletion.', err);
        }
        res.clearCookie('connect.sid');
        return res.status(200).json(new apiResponse(null, "Account successfully deleted.", 200));
      });
    });

  } catch (error) {
    console.error("Delete Account Error:", error);
    next(error);
  }
};
