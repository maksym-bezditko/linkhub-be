/*
  Warnings:

  - You are about to drop the column `s3_link` on the `Image` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Image_s3_link_key";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "s3_link";
