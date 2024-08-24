/*
  Warnings:

  - You are about to drop the column `image` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "image",
ADD COLUMN     "imageId" INTEGER;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("campus_id") ON DELETE SET NULL ON UPDATE CASCADE;
