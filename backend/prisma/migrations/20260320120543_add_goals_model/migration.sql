-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('CODING_TIME', 'STREAK', 'COMMITS', 'FOCUS_TIME', 'CUSTOM');

-- CreateEnum
CREATE TYPE "GoalPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "Goal" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "GoalType" NOT NULL DEFAULT 'CUSTOM',
    "period" "GoalPeriod" NOT NULL DEFAULT 'WEEKLY',
    "targetValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT '',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "weekStart" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
