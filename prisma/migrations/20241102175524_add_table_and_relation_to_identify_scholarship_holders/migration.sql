/*
  Warnings:

  - You are about to drop the column `isScholarshipHolder` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isScholarshipHolder";

-- CreateTable
CREATE TABLE "ScholarshipHolder" (
    "registration" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ScholarshipHolder_registration_key" ON "ScholarshipHolder"("registration");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_registration_fkey" FOREIGN KEY ("registration") REFERENCES "ScholarshipHolder"("registration") ON DELETE RESTRICT ON UPDATE CASCADE;
