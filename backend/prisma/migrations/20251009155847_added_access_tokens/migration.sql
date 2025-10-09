-- AlterTable
ALTER TABLE "users" ADD COLUMN     "githubAccessToken" TEXT,
ADD COLUMN     "githubRefreshToken" TEXT,
ALTER COLUMN "googleAccessToken" DROP NOT NULL,
ALTER COLUMN "googleRefreshToken" DROP NOT NULL;
