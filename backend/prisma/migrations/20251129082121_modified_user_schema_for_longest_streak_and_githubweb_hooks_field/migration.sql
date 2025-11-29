-- AlterTable
ALTER TABLE "users" ADD COLUMN     "githubWebHookConfig" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0;
