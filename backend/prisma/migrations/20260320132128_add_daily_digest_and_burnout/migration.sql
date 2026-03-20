-- CreateEnum
CREATE TYPE "BurnoutLevel" AS ENUM ('NONE', 'MILD', 'MODERATE', 'SEVERE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "burnoutAlertedAt" TIMESTAMP(3),
ADD COLUMN     "burnoutLevel" "BurnoutLevel" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "burnoutScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dailyDigestEnabled" BOOLEAN NOT NULL DEFAULT true;
