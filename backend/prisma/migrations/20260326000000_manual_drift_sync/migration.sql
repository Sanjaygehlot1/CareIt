-- Manual sync for drift: session table and hasAcceptedTerms
-- These were added outside of Prisma (by connect-pg-simple or manually)

-- CreateTable (If doesn't exist)
CREATE TABLE IF NOT EXISTS "session" (
    "sid" VARCHAR NOT NULL,
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session"("expire");

-- AddColumn to users (If doesn't exist)
-- Since Prisma drift saw it as "Added in DB but missing in migrations", we capture it here.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "hasAcceptedTerms" BOOLEAN NOT NULL DEFAULT false;
