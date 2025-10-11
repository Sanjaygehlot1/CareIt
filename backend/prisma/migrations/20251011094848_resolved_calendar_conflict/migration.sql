/*
  Warnings:

  - A unique constraint covering the columns `[googleProviderId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "googleEmail" TEXT,
ADD COLUMN     "googleProviderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_googleProviderId_key" ON "users"("googleProviderId");
