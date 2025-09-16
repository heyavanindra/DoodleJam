import { prismaClient } from "@repo/db";
import { createWorker } from "@repo/queue";
import { shapesSchema } from "@repo/common";
createWorker("shapesQueue", async (job) => {
  const parsedData = shapesSchema.safeParse(job.data);
  if (!parsedData.success) {
    return;
  }
  try {
    switch (parsedData.data.shapeType) {
      case "RECT":
        const data = await prismaClient.shapes.create({
          data: {
            roomId: Number(parsedData.data.roomId),
            shape: parsedData.data.shapeType,
            data: {
              x: parsedData.data.shapes.x,
              y: parsedData.data.shapes.y,
              width: parsedData.data.shapes.width,
              height: parsedData.data.shapes.height,
            },
          },
        });
        break;
      case "CIRCLE":
        break;
      case "PENCIL":
        break;
    }

    console.log(parsedData.data);
  } catch (error) {
    console.error(error);
  }
});
