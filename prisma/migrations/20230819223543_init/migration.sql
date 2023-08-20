/*
  Warnings:

  - You are about to drop the column `access_token` on the `AuthInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuthInfo" DROP COLUMN "access_token";
