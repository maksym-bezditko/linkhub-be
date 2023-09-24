/*
  Warnings:

  - You are about to drop the `Destination` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `role` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Destination" DROP CONSTRAINT "Destination_imageId_fkey";

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "role" "Role" NOT NULL;

-- DropTable
DROP TABLE "Destination";
