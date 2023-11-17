/*
  Warnings:

  - The primary key for the `follows` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `followingId` on the `follows` table. All the data in the column will be lost.
  - Added the required column `followingUserId` to the `follows` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_followingId_fkey";

-- AlterTable
ALTER TABLE "follows" DROP CONSTRAINT "follows_pkey",
DROP COLUMN "followingId",
ADD COLUMN     "followingUserId" UUID NOT NULL,
ADD CONSTRAINT "follows_pkey" PRIMARY KEY ("followingUserId", "followedUserId");

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followingUserId_fkey" FOREIGN KEY ("followingUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
