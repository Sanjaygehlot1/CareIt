import dotenv from 'dotenv'

dotenv.config({
    path: '.env',
    debug : true
})

export const PORT = process.env.PORT!
export const DB_URI = process.env.DATABASE_URL!
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL!
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!
export const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL!
export const SESSION_SECRET = process.env.SESSION_SECRET!
export const JWT_SECRET = process.env.JWT_SECRET!
export const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL!
export const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET!
export const GITHUB_APP_CLIENT_SECRET = process.env.GITHUB_APP_CLIENT_SECRET!
export const GITHUB_APP_ID = process.env.GITHUB_APP_ID!
export const GITHUB_APP_CLIENT_ID = process.env.GITHUB_APP_CLIENT_ID!


export const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com'
export const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587')
export const SMTP_USER = process.env.SMTP_USER || ''
export const SMTP_PASS = process.env.SMTP_PASS || ''
export const SMTP_FROM = process.env.SMTP_FROM || 'CareIt <noreply@careit.dev>'
export const RESEND_API_KEY = process.env.RESEND_API_KEY

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
