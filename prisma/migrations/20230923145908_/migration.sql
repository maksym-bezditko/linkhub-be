/*
  Warnings:

  - You are about to drop the column `user_id` on the `File` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_user_id_fkey";

-- DropIndex
DROP INDEX "File_user_id_key";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "user_id";
