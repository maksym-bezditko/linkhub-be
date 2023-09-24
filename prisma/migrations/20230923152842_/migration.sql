/*
  Warnings:

  - You are about to drop the column `file_id` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `file_id` on the `Profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[post_image_id]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profile_image_id]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `post_image_id` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_image_id` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_file_id_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_file_id_fkey";

-- DropIndex
DROP INDEX "Post_file_id_key";

-- DropIndex
DROP INDEX "Profile_file_id_key";

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "post_image_id" TEXT NOT NULL,
ADD COLUMN     "profile_image_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "file_id";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "file_id";

-- CreateIndex
CREATE UNIQUE INDEX "File_post_image_id_key" ON "File"("post_image_id");

-- CreateIndex
CREATE UNIQUE INDEX "File_profile_image_id_key" ON "File"("profile_image_id");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_post_image_id_fkey" FOREIGN KEY ("post_image_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_profile_image_id_fkey" FOREIGN KEY ("profile_image_id") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
