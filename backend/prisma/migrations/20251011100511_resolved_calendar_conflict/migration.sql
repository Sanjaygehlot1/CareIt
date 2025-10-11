/*
  Warnings:

  - A unique constraint covering the columns `[githubProviderId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "githubConnected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "githubProviderId" TEXT,
ADD COLUMN     "githubUsername" TEXT,
ALTER COLUMN "profileUrl" DROP NOT NULL,
ALTER COLUMN "calendar" SET DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "users_githubProviderId_key" ON "users"("githubProviderId");
