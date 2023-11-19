/*
  Warnings:

  - You are about to drop the column `age` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "age",
ADD COLUMN     "birthday" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
