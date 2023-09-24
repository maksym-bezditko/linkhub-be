/*
  Warnings:

  - You are about to drop the column `image_id` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `profile_image_id` on the `Profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[image]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profile_image]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `image` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_image` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_image_id_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_profile_image_id_fkey";

-- DropIndex
DROP INDEX "Post_image_id_key";

-- DropIndex
DROP INDEX "Profile_profile_image_id_key";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "image_id",
ADD COLUMN     "image" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "profile_image_id",
ADD COLUMN     "profile_image" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Post_image_key" ON "Post"("image");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_profile_image_key" ON "Profile"("profile_image");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_profile_image_fkey" FOREIGN KEY ("profile_image") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_image_fkey" FOREIGN KEY ("image") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
