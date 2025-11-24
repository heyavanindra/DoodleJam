import { prismaClient } from "@repo/db";
import { createWorker } from "@repo/queue";
import { shapesSchema } from "@repo/common";
createWorker("shapesQueue", async (job) => {
  console.log("here i am");
  console.log("jobs data", job.data);
  const data = {
    roomId: job.data.roomId,
    shapeAction: job.data.shapeAction,
    shapes: JSON.parse(job.data.shapes),
  };
  console.log("after parsing data", data);
  const parsedData = shapesSchema.safeParse(data);
  if (!parsedData.success) {
    console.log("succeeded", parsedData.error.message);
    return;
  }
  console.log("parsed data", parsedData.data);
  try {
    if (parsedData.data.shapeAction === "CREATE") {
      console.log("updating data");
     const dbData =  await prismaClient.room.update({
        where: {
          id: Number(parsedData.data.roomId),
        },
        data: {
          shapes: {
            push: [parsedData.data.shapes],
          },
        },
      });
     console.log("data data",dbData.shapes)
    } else if (parsedData.data.shapeAction === "DELETE") {
      const room = await prismaClient.room.findUnique({
        where: { id: Number(parsedData.data.roomId) },
        select: { shapes: true },
      });

      const objectId = parsedData.data.shapes?.id as { id: string };
      const filteredRoom = room?.shapes.filter((shape) => {
        const s = shape as { id: string }; // type assertion
        return s.id !== objectId.id;
      });
      await prismaClient.room.update({
        where: {
          id: Number(parsedData.data.roomId),
        },
        data: {
          shapes: filteredRoom,
        },
      });
    }

    console.log(parsedData.data);
  } catch (error) {
    console.error(error);
  }
});
