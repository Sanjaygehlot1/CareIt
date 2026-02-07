/*
  Warnings:

  - You are about to drop the column `file` on the `EditorActivity` table. All the data in the column will be lost.
  - You are about to drop the column `keystrokes` on the `EditorActivity` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `EditorActivity` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,projectName,date]` on the table `EditorActivity` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."EditorActivity_userId_projectName_file_date_key";

-- AlterTable
ALTER TABLE "EditorActivity" DROP COLUMN "file",
DROP COLUMN "keystrokes",
DROP COLUMN "language";

-- AlterTable
ALTER TABLE "StreakStats" ADD COLUMN     "codingDuration" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "commitCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "streakUpdatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "EditorActivity_userId_projectName_date_key" ON "EditorActivity"("userId", "projectName", "date");
