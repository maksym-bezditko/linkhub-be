/*
  Warnings:

  - You are about to drop the column `refresh_token` on the `AuthInfo` table. All the data in the column will be lost.
  - Added the required column `refresh_token_hash` to the `AuthInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuthInfo" DROP COLUMN "refresh_token",
ADD COLUMN     "refresh_token_hash" TEXT NOT NULL;
