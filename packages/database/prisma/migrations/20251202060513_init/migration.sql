/*
  Warnings:

  - The `shapes` column on the `Room` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Room" DROP COLUMN "shapes",
ADD COLUMN     "shapes" JSONB[];
