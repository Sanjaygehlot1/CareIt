-- AlterTable
ALTER TABLE "users" ADD COLUMN     "calendarError" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "githubError" BOOLEAN NOT NULL DEFAULT false;
