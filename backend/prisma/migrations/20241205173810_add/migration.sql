/*
  Warnings:

  - Added the required column `file_path` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "file_path" TEXT NOT NULL;
