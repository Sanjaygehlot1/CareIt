/*
  Warnings:

  - You are about to drop the column `recordedAt` on the `EditorActivity` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,projectName,file,date]` on the table `EditorActivity` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `EditorActivity` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."EditorActivity_userId_recordedAt_idx";

-- AlterTable
ALTER TABLE "EditorActivity" DROP COLUMN "recordedAt",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "duration" SET DEFAULT 0,
ALTER COLUMN "keystrokes" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "EditorActivity_userId_projectName_file_date_key" ON "EditorActivity"("userId", "projectName", "file", "date");
