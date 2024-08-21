/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('MORNING', 'AFTERNOON', 'NIGHT');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('LOST', 'DELIVERED', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_author_id_fkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Item" (
    "item_id" SERIAL NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'LOST',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "foundBy" TEXT NOT NULL,
    "foundLocation" TEXT NOT NULL,
    "foundDate" TIMESTAMP(3) NOT NULL,
    "image" TEXT NOT NULL,
    "shift" "Shift" NOT NULL,
    "withdrawalDeadline" TIMESTAMP(3) NOT NULL,
    "pickupLocation" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "Claimant" (
    "claimant_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "document" VARCHAR(14) NOT NULL,

    CONSTRAINT "Claimant_pkey" PRIMARY KEY ("claimant_id")
);

-- CreateTable
CREATE TABLE "ClaimedItem" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "claimantId" INTEGER NOT NULL,
    "withdrawalDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "picture" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_item_id_key" ON "Item"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "Claimant_claimant_id_key" ON "Claimant"("claimant_id");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimedItem_id_key" ON "ClaimedItem"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimedItem_itemId_key" ON "ClaimedItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_id_key" ON "User"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimedItem" ADD CONSTRAINT "ClaimedItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimedItem" ADD CONSTRAINT "ClaimedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimedItem" ADD CONSTRAINT "ClaimedItem_claimantId_fkey" FOREIGN KEY ("claimantId") REFERENCES "Claimant"("claimant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
