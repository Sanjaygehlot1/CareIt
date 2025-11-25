import passport from 'passport'
import GoogleStrategy from 'passport-google-oauth20'
import { prisma } from '../prisma'
import { GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_SECRET } from '../secrets'
import { Request } from 'express'


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

            const user = await prisma.user.upsert({
                where: { googleProviderId: profile.id },
                create: {
                    name: profile.displayName!,
                    email: profile.emails![0].value,
                    provider: 'google',
                    profileUrl: profile.photos?.[0].value || '',
                    googleAccessToken: accessToken,
                    googleRefreshToken: refreshToken || null,
                    googleProviderId : profile.id,
                    calendar: hasCalendarScope
                },
                update: {
                    profileUrl: profile.photos?.[0].value,
                    name: profile.displayName,
                    googleAccessToken: accessToken,
                    ...(refreshToken && { googleRefreshToken: refreshToken }),
                    ...(hasCalendarScope && { calendar : true})
                }
            });

            console.log("User upserted successfully:", user);
            done(null, user);

        } catch (error) {
            console.error("=== PASSPORT STRATEGY ERROR ===");
            console.error(error);
            done(error, undefined);
        }
    }
));

passport.serializeUser((user: any, done) => {
    console.log("Serializing user:", user);
    try {
        done(null, user.id)
    } catch (error) {
        console.error("Serialize error:", error);
        done(error, null);
    }
})

passport.deserializeUser(async (id: any, done) => {
    console.log("Deserializing user:", id);
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            console.log("User not found in database");
            return done(null, false);
        }
        console.log("User deserialized:", user);
        done(null, user);
    } catch (error) {
        console.error("Deserialize error:", error);
        done(error, null);
    }
})

export default passport;