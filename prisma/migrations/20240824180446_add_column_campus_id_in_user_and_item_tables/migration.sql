/*
  Warnings:

  - Added the required column `campusId` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campusId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "campusId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "campusId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("campus_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("campus_id") ON DELETE RESTRICT ON UPDATE CASCADE;
