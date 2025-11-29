-- AlterTable
ALTER TABLE "users" ADD COLUMN     "githubAppInstallationId" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "githubAppInstalled" BOOLEAN NOT NULL DEFAULT false;
