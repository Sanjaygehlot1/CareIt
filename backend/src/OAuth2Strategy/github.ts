import passport from 'passport'
import {Strategy as GitHubStrategy} from 'passport-github2'
import { prisma } from '../prisma'
import { GITHUB_CALLBACK_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET} from '../secrets'



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
    profileUrl?: string;
    accessToken?: string;
}

passport.use(new GitHubStrategy(
    {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: GITHUB_CALLBACK_URL,
        scope: ['user:email']
    },
    async (
        accessToken: string,
        refreshToken: string,
        profile: GitHubProfile,
        done: (error: any, user?: GitHubUser) => void
    ) => {
        try {

            const user: GitHubUser = {
                name: profile.displayName! || profile.username!,
                email: profile.emails![0].value,
                provider: profile.provider,
                providerId: profile.id,
                profileUrl: profile.photos?.[0].value,
                accessToken
            };

            done(null, user);

        } catch (error) {
            done(error, undefined);
        }
    }
));



export default passport;