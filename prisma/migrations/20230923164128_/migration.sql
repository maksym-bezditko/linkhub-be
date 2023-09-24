-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_post_id_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_profile_id_fkey";

-- AlterTable
ALTER TABLE "Image" ALTER COLUMN "post_id" DROP NOT NULL,
ALTER COLUMN "profile_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE SET NULL;
