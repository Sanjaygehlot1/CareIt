/*
  Warnings:

  - Added the required column `calendar` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `googleAccessToken` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `googleRefreshToken` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "calendar" BOOLEAN NOT NULL,
ADD COLUMN     "googleAccessToken" TEXT NOT NULL,
ADD COLUMN     "googleRefreshToken" TEXT NOT NULL;
