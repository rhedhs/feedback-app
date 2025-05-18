/*
  Warnings:

  - Added the required column `updatedAt` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Feedback` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedFeedback" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "sharedById" TEXT NOT NULL,
    "sharedWithId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SharedFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SharedFeedback_feedbackId_sharedWithId_key" ON "SharedFeedback"("feedbackId", "sharedWithId");

-- Add default user for existing feedback
INSERT INTO "User" ("id", "name", "email", "password", "createdAt", "updatedAt")
VALUES ('default-user', 'Default User', 'default@example.com', '$2a$12$defaultpasswordhash', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add updatedAt column with default value
ALTER TABLE "Feedback" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add drawing column
ALTER TABLE "Feedback" ADD COLUMN "drawing" TEXT;

-- Update existing feedback to use default user
UPDATE "Feedback" SET "userId" = 'default-user' WHERE "userId" IS NULL;

-- Make userId required
ALTER TABLE "Feedback" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedFeedback" ADD CONSTRAINT "SharedFeedback_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedFeedback" ADD CONSTRAINT "SharedFeedback_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedFeedback" ADD CONSTRAINT "SharedFeedback_sharedWithId_fkey" FOREIGN KEY ("sharedWithId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
