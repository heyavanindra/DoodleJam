/*
  Warnings:

  - You are about to drop the column `shape` on the `Shapes` table. All the data in the column will be lost.
  - Added the required column `shapeType` to the `Shapes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Shapes" DROP COLUMN "shape",
ADD COLUMN     "shapeType" "public"."ShapesTypes" NOT NULL;
