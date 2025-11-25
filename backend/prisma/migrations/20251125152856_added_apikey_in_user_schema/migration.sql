/*
  Warnings:

  - You are about to drop the column `googleEmail` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[apiKey]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "googleEmail",
ADD COLUMN     "apiKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_apiKey_key" ON "users"("apiKey");
