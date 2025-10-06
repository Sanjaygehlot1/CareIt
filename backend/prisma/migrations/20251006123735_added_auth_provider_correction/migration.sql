/*
  Warnings:

  - A unique constraint covering the columns `[providerId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_providerId_key" ON "users"("providerId");
