/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `ScholarshipHolder` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[scholarshipHolderId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_registration_fkey";

-- AlterTable
ALTER TABLE "ScholarshipHolder" ADD COLUMN     "user_id" SERIAL NOT NULL,
ADD CONSTRAINT "ScholarshipHolder_pkey" PRIMARY KEY ("user_id");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "scholarshipHolderId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ScholarshipHolder_user_id_key" ON "ScholarshipHolder"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_scholarshipHolderId_key" ON "User"("scholarshipHolderId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_scholarshipHolderId_fkey" FOREIGN KEY ("scholarshipHolderId") REFERENCES "ScholarshipHolder"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
