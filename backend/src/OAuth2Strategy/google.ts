import passport from 'passport'
import GoogleStrategy from 'passport-google-oauth20'
import { prisma } from '../prisma'
import { GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_SECRET } from '../secrets'
import { Request } from 'express'
import { sendWelcomeEmail } from '../utils/emailService';

class CustomGoogleStrategy extends GoogleStrategy.Strategy {
    authenticate(req: any, options?: any) {
        if (options && options.loginHint) {
            const originalAuthParams = this.authorizationParams;
            this.authorizationParams = function (options: any) {
                const params: any = originalAuthParams.call(this, options);
                params.login_hint = options.loginHint;
                return params;
            };
        }

        super.authenticate(req, options);
    }
}

passport.use(new CustomGoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
    passReqToCallback: true
},
    async (req: Request, accessToken, refreshToken, profile, done) => {

        try {
            const grantedScopes = (profile as any)?._json?.granted_scopes || '';
            const hasCalendarScope = grantedScopes.includes('https://www.googleapis.com/auth/calendar.readonly');


            if (req.user && (req.user as any).id) {
                const currentUser = req.user as any;

                const existingGoogleUser = await prisma.user.findUnique({
                    where: { googleProviderId: profile.id }
                });

                if (existingGoogleUser && existingGoogleUser.id !== currentUser.id) {
                    console.error("CONFLICT DETECTED");
                    console.error("Logged in user:", {
                        id: currentUser.id,
                        email: currentUser.email,
                        provider: currentUser.provider
                    });
                    console.error("Google account already belongs to:", {
                        id: existingGoogleUser.id,
                        email: existingGoogleUser.email,
                        provider: existingGoogleUser.provider
                    });

                    const error: any = new Error('GOOGLE_ACCOUNT_ALREADY_REGISTERED');
                    error.details = {
                        googleEmail: profile.emails![0].value,
                        existingAccountEmail: existingGoogleUser.email,
                        currentUserProvider: currentUser.provider
                    };

                    return done(error, undefined);
                }

                const updatedUser = await prisma.user.update({
                    where: { id: currentUser.id },
                    data: {
                        googleAccessToken: accessToken,
                        googleRefreshToken: refreshToken,
                        calendar: true,
                        ...(currentUser.provider !== 'google' && {
                            googleProviderId: profile.id,
                            googleEmail: profile.emails![0].value
                        })
                    }
                });

                return done(null, updatedUser);
            }


            let user = await prisma.user.findUnique({
                where: { googleProviderId: profile.id }
            });

            const isNewUser = !user;

            if (isNewUser) {
                user = await prisma.user.create({
                    data: {
                        name: profile.displayName!,
                        email: profile.emails![0].value,
                        provider: 'google',
                        profileUrl: profile.photos?.[0].value || '',
                        googleAccessToken: accessToken,
                        googleRefreshToken: refreshToken || null,
                        googleProviderId : profile.id,
                        calendar: hasCalendarScope
                    }
                });

                sendWelcomeEmail(user.email, user.name).catch(console.error);
            } else {
                user = await prisma.user.update({
                    where: { googleProviderId: profile.id },
                    data: {
                        profileUrl: profile.photos?.[0].value,
                        name: profile.displayName,
                        googleAccessToken: accessToken,
                        ...(refreshToken && { googleRefreshToken: refreshToken }),
                        ...(hasCalendarScope && { calendar : true})
                    }
                });
            }

            console.log("User synced successfully:", user);
            done(null, user);

        } catch (error) {
            console.error("=== PASSPORT STRATEGY ERROR ===");
            console.error(error);
            done(error, undefined);
        }
    }
));

const userCache = new Map<number, { user: any; expires: number }>();

passport.serializeUser((user: any, done) => {
    try {
        done(null, user.id)
    } catch (error) {
        console.error("Serialize error:", error);
        done(error, null);
    }
})

passport.deserializeUser(async (id: any, done) => {
    
    const cached = userCache.get(id);
    if (cached && cached.expires > Date.now()) {
        return done(null, cached.user);
    }

    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            console.log("User not found in database");
            return done(null, false);
        }

    
        userCache.set(id, { user, expires: Date.now() + 2000 });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
})

export default passport;