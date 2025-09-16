/*
  Warnings:

  - You are about to drop the column `x` on the `Shapes` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `Shapes` table. All the data in the column will be lost.
  - Added the required column `data` to the `Shapes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Shapes" DROP COLUMN "x",
DROP COLUMN "y",
ADD COLUMN     "data" JSONB NOT NULL;
