/*
  Warnings:

  - You are about to drop the `Stats` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `userId` on the `FocusStats` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."FocusStats" DROP CONSTRAINT "FocusStats_userId_fkey";

-- DropIndex
DROP INDEX "public"."users_providerId_key";

-- AlterTable
ALTER TABLE "FocusStats" DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."Stats";

-- CreateTable
CREATE TABLE "EditorActivity" (
    "id" SERIAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "language" TEXT,
    "projectName" TEXT,
    "file" TEXT,
    "keystrokes" INTEGER,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "EditorActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EditorActivity_userId_recordedAt_idx" ON "EditorActivity"("userId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FocusStats_userId_date_key" ON "FocusStats"("userId", "date");

-- AddForeignKey
ALTER TABLE "EditorActivity" ADD CONSTRAINT "EditorActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusStats" ADD CONSTRAINT "FocusStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
