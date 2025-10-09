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
             const user = await prisma.user.upsert({
                        where: { providerId: profile.id },
                        create: {
                            name: profile.displayName!,
                            email: profile.emails![0].value,
                            provider: profile.provider,
                            profileUrl: profile.photos?.[0].value!,
                            providerId: profile.id,
                            googleAccessToken : accessToken,
                            googleRefreshToken : refreshToken,
                            calendar : false
                        },
                        update: {
                            profileUrl: profile.photos?.[0].value,
                            name: profile.displayName,
                            googleAccessToken : accessToken,
                            googleRefreshToken : refreshToken
                        }
            
                    })

            done(null, user);

        } catch (error) {
            done(error, undefined);
        }
    }
))

passport.serializeUser((user: any, done) => {
    try {
        done(null, user.id)
    } catch (error) {
        console.log(error)
    }
})

passport.deserializeUser(async (id: any, done) => {
    try {
        const user = await prisma.user.findUnique({where : {id}})
        done(null, user)
    }catch (error) {
        console.log(error)
}}
)

export default passport;