-- CreateEnum
CREATE TYPE "public"."ShapesTypes" AS ENUM ('RECT', 'CIRCLE', 'LINE');

-- CreateTable
CREATE TABLE "public"."Room" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Shapes" (
    "id" SERIAL NOT NULL,
    "shape" "public"."ShapesTypes" NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "roomId" INTEGER,

    CONSTRAINT "Shapes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Room" ADD CONSTRAINT "Room_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shapes" ADD CONSTRAINT "Shapes_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
