/*
  Warnings:

  - The values [LINE] on the enum `ShapesTypes` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ShapesTypes_new" AS ENUM ('RECT', 'CIRCLE', 'PENCIL');
ALTER TABLE "public"."Shapes" ALTER COLUMN "shape" TYPE "public"."ShapesTypes_new" USING ("shape"::text::"public"."ShapesTypes_new");
ALTER TYPE "public"."ShapesTypes" RENAME TO "ShapesTypes_old";
ALTER TYPE "public"."ShapesTypes_new" RENAME TO "ShapesTypes";
DROP TYPE "public"."ShapesTypes_old";
COMMIT;
