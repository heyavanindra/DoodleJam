/*
  Warnings:

  - You are about to drop the `Shapes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Shapes" DROP CONSTRAINT "Shapes_roomId_fkey";

-- AlterTable
ALTER TABLE "public"."Room" ADD COLUMN     "shapes" JSONB[];

-- DropTable
DROP TABLE "public"."Shapes";

-- DropEnum
DROP TYPE "public"."ShapesTypes";
