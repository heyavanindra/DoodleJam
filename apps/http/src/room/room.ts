import { CreateRoomSchema } from "@repo/common/types";
import { prisma } from "@repo/db";
import express, { Request, Response, Router } from "express";
import { middleware } from "../middleware/middleware";

const roomRouter: Router = express.Router();

roomRouter.post("/", middleware, async (req: Request, res: Response) => {
  const data = CreateRoomSchema.safeParse(req.body);

  if (!data.success) {
    res.status(500).json({
      message: data.error.message ||  "failed to create a room",
    });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.json({
      message: "unAuthorize",
    });
    return;
  }
  try {
    const room = await prisma.room.create({
      data: {
        slug: data.data.name,
        adminId: userId,
      },
    });

    res.status(201).json({
      message: "Room is created",
      roomId :room.id,
    });
  } catch (error) {
    console.error(error);
    res.status(501).json({
      message: "Error while creating room",
    });
    return;
  }
});

roomRouter.get("/", async (req: Request, res: Response) => {
  const roomId = Number(req.params.roomId);
 try {
  const message = await prisma.chat.findMany({
    where: {
      roomId: roomId,
    },
    orderBy: {
      id: "desc",
    },
    take: 50,
  });
  res.status(200).json({
    message:message
  })
 } catch (error) {
  console.error(error)
   res.status(500).json({
    message:"Error while fetching the room"
  })
 }
});

roomRouter.get("/:slug",async (req:Request,res:Response) => {
  const slug = req.params.slug;
 try {
  const room = await prisma.room.findFirst({
    where:{
      slug
    }
  })
  res.status(200).json({
    roomId:room?.id
  })
 } catch (error) {
  res.status(500).json({
    message:"Can't find any room with this slug"
  })
 }



})

export default roomRouter;
