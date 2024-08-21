/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[registration]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `registration` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "foundBy" DROP NOT NULL,
ALTER COLUMN "foundLocation" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
ADD COLUMN     "registration" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_registration_key" ON "User"("registration");
