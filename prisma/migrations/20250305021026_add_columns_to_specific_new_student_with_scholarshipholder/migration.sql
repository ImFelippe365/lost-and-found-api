/*
  Warnings:

  - Added the required column `campusId` to the `ScholarshipHolder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ScholarshipHolder" ADD COLUMN     "campusId" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT;

-- AddForeignKey
ALTER TABLE "ScholarshipHolder" ADD CONSTRAINT "ScholarshipHolder_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("campus_id") ON DELETE RESTRICT ON UPDATE CASCADE;
