/*
  Warnings:

  - The primary key for the `posts_hashtags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `posts_hashtags` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "posts_hashtags" DROP CONSTRAINT "posts_hashtags_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "posts_hashtags_pkey" PRIMARY KEY ("postId", "hashtagId");
