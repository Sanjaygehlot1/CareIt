-- AlterTable
ALTER TABLE "users" ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "aiSummaryGenerationCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "aiSummaryUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "geminiApiKey" TEXT,
ADD COLUMN     "lastAiSummaryResetAt" TIMESTAMP(3);
