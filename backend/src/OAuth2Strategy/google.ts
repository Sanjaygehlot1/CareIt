import passport from 'passport'
import GoogleStrategy from 'passport-google-oauth20'
import { prisma } from '../prisma'
import { GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_SECRET } from '../secrets'



passport.use(new GoogleStrategy.Strategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const user = {
                name: profile.displayName! || profile.username!,
                email: profile.emails![0].value,
                provider: profile.provider,
                providerId: profile.id,
                profileUrl: profile.photos?.[0].value,
                accessToken
            }

            done(null, user);

        } catch (error) {
            done(error, undefined);
        }
    }
))

passport.serializeUser((user: any, done) => {
    try {
        done(null, user)
    } catch (error) {
        console.log(error)
    }
})

passport.deserializeUser(async (user: any, done) => {
    try {
        done(null, user)
    }catch (error) {
        console.log(error)
}}
)

export default passport;