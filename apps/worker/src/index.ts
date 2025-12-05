import { prismaClient } from "@repo/db";
import { createWorker } from "@repo/queue";
import { shapesSchema } from "@repo/common";

createWorker("shapesQueue", async (job) => {
  const data = {
    roomId: job.data.roomId,
    shapeAction: job.data.shapeAction,
    shapes: JSON.parse(job.data.shapes),
  };
  const parsedData = shapesSchema.safeParse(data);
  if (!parsedData.success) {
    return;
  }
  try {
    if (parsedData.data.shapeAction === "CREATE") {
      const dbData = await prismaClient.room.update({
        where: {
          id: Number(parsedData.data.roomId),
        },
        data: {
          shapes: {
            push: [parsedData.data.shapes],
          },
        },
      });
    } else if (parsedData.data.shapeAction === "DELETE") {
      const room = await prismaClient.room.findUnique({
        where: { id: Number(parsedData.data.roomId) },
        select: { shapes: true },
      });
      const targetId = (parsedData.data.shapes as { id: string }).id;
      let filterShapeIndex = 0;
      let found = false;
      room?.shapes.map((shape, idx) => {
        const s = shape as [{ id: string }];
        if (s[0].id === targetId) {
          found = true;
          filterShapeIndex = idx;
          return;
        }
      });

      if (!found) {
        return;
      }
      room?.shapes.splice(filterShapeIndex, 1);
    
      const shapesRemoved = await prismaClient.room.update({
        where: {
          id: Number(parsedData.data.roomId),
        },
        data: {
          shapes: {
            set: room?.shapes,
          },
        },
      });
    } else if (parsedData.data.shapeAction === "UPDATE") {
      const room = await prismaClient.room.findUnique({
        where: { id: Number(parsedData.data.roomId) },
        select: { shapes: true },
      });
      const targetId = (parsedData.data.shapes as { id: string }).id;
      let filterShapeIndex = 0;
      let found = false;
      room?.shapes.map((shape, idx) => {
        const s = shape as [{ id: string }];
        if (s[0].id === targetId) {
          found = true;
          filterShapeIndex = idx;
          return;
        }
      });

      if (!found) {
        return;
      }
      room?.shapes.splice(filterShapeIndex, 1);
      room?.shapes.push([JSON.parse(parsedData.data.shapes?.shape.message)]);
      const shapesRemoved = await prismaClient.room.update({
        where: {
          id: Number(parsedData.data.roomId),
        },
        data: {
          shapes: {
            set: room?.shapes,
          },
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
});
