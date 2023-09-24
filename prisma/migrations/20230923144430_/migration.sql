/*
  Warnings:

  - You are about to drop the column `photo_link` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `user_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `UserInfo` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[image_id]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `Follow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_id` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserInfo" DROP CONSTRAINT "UserInfo_user_id_fkey";

-- DropIndex
DROP INDEX "User_user_name_key";

-- AlterTable
ALTER TABLE "Follow" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "photo_link",
ADD COLUMN     "image_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "user_name";

-- DropTable
DROP TABLE "UserInfo";

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "profile_image_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "bio" TEXT,
    "fileId" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "s3_link" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_user_id_key" ON "Profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_profile_image_id_key" ON "Profile"("profile_image_id");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_user_name_key" ON "Profile"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "File_user_id_key" ON "File"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "File_s3_link_key" ON "File"("s3_link");

-- CreateIndex
CREATE UNIQUE INDEX "File_name_key" ON "File"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Post_image_id_key" ON "Post"("image_id");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_profile_image_id_fkey" FOREIGN KEY ("profile_image_id") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
