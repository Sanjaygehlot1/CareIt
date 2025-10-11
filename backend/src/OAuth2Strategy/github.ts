// In your GitHub OAuth strategy file
import passport = require("passport");
import { Strategy as GitHubStrategy } from "passport-github2";
import { GITHUB_CALLBACK_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "../secrets";
import { Request } from "express";
import { prisma } from "../prisma";

interface GitHubProfile {
    id: string;
    username?: string;
    displayName?: string;
    emails?: { value: string }[];
    provider: string;
    photos?: { value: string }[];
}

interface GitHubUser {
    name: string;
    email: string;
    provider: string;
    providerId: string;
    profileUrl?: string | null;
    accessToken?: string;
}



passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: GITHUB_CALLBACK_URL,
    passReqToCallback: true,
},
    async (req: Request, accessToken: string, refreshToken: string, profile: GitHubProfile, done: (error? : any, user? : GitHubUser) => void) => {
        console.log("\n=== GITHUB STRATEGY EXECUTING ===");
        console.log("Profile ID:", profile.id);
        console.log("Profile Username:", profile.username);
        console.log("Req.user (existing session):", req.user);

        try {
            if (req.user && (req.user as any).id) {
                const currentUser = req.user as any;
                console.log("GitHub connect flow for user:", currentUser.id);

                const existingGithubUser = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { providerId: profile.id },
                            { githubProviderId: profile.id }
                        ]
                    }
                });

                if (existingGithubUser && existingGithubUser.id !== currentUser.id) {
                    console.error("CONFLICT: GitHub account already registered to different user");
                    return done(new Error('This GitHub account is already connected to another account.'));
                }

                const updatedUser = await prisma.user.update({
                    where: { id: currentUser.id },
                    data: {
                        githubAccessToken: accessToken,
                        githubProviderId: profile.id,
                        githubUsername: profile.username,
                        githubConnected: true
                    }
                });

                console.log("GitHub connected successfully");
                return done(null, updatedUser);
            }

            console.log("GitHub login flow");
            const user = await prisma.user.upsert({
                where: { providerId: profile.id },
                create: {
                    name: profile.displayName || profile.username!,
                    email: profile.emails?.[0].value || `${profile.username}@github.local`,
                    provider: 'github',
                    providerId: profile.id,
                    profileUrl: profile.photos?.[0].value,
                    githubAccessToken: accessToken,
                    githubUsername: profile.username,
                    githubConnected: true
                },
                update: {
                    name: profile.displayName || profile.username,
                    githubAccessToken: accessToken,
                    profileUrl: profile.photos?.[0].value
                }
            });

            done(null, user);
        } catch (error) {
            console.error("GitHub strategy error:", error);
            done(error);
        }
    }
));