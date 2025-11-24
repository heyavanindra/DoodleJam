/*
  Warnings:

  - You are about to drop the column `shapeType` on the `Shapes` table. All the data in the column will be lost.
  - The `data` column on the `Shapes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `roomId` on table `Shapes` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Shapes" DROP CONSTRAINT "Shapes_roomId_fkey";

-- AlterTable
ALTER TABLE "public"."Shapes" DROP COLUMN "shapeType",
ALTER COLUMN "roomId" SET NOT NULL,
DROP COLUMN "data",
ADD COLUMN     "data" JSONB[];

-- AddForeignKey
ALTER TABLE "public"."Shapes" ADD CONSTRAINT "Shapes_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
