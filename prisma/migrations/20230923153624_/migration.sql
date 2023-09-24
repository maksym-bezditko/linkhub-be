/*
  Warnings:

  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_post_image_id_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_profile_image_id_fkey";

-- DropTable
DROP TABLE "File";

-- CreateTable
CREATE TABLE "ProfileImage" (
    "id" TEXT NOT NULL,
    "s3_link" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profile_image_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostImage" (
    "id" TEXT NOT NULL,
    "s3_link" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "post_image_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfileImage_s3_link_key" ON "ProfileImage"("s3_link");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileImage_name_key" ON "ProfileImage"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileImage_profile_image_id_key" ON "ProfileImage"("profile_image_id");

-- CreateIndex
CREATE UNIQUE INDEX "PostImage_s3_link_key" ON "PostImage"("s3_link");

-- CreateIndex
CREATE UNIQUE INDEX "PostImage_name_key" ON "PostImage"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PostImage_post_image_id_key" ON "PostImage"("post_image_id");

-- AddForeignKey
ALTER TABLE "ProfileImage" ADD CONSTRAINT "ProfileImage_profile_image_id_fkey" FOREIGN KEY ("profile_image_id") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostImage" ADD CONSTRAINT "PostImage_post_image_id_fkey" FOREIGN KEY ("post_image_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
