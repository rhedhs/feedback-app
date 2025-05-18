-- AlterTable
ALTER TABLE "Feedback" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropEnum
DROP TYPE "UserRole";
