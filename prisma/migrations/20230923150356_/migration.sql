/*
  Warnings:

  - You are about to drop the column `image` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `profile_image` on the `Profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[file_id]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[file_id]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `file_id` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_id` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_image_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_profile_image_fkey";

-- DropIndex
DROP INDEX "Post_image_key";

-- DropIndex
DROP INDEX "Profile_profile_image_key";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "image",
ADD COLUMN     "file_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "profile_image",
ADD COLUMN     "file_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Post_file_id_key" ON "Post"("file_id");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_file_id_key" ON "Profile"("file_id");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
