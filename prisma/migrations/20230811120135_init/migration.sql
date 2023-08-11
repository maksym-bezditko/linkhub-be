/*
  Warnings:

  - You are about to drop the column `expiration_date` on the `AuthInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuthInfo" DROP COLUMN "expiration_date",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
