/*
  Warnings:

  - A unique constraint covering the columns `[shareToken]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "shareToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Submission_shareToken_key" ON "Submission"("shareToken");
