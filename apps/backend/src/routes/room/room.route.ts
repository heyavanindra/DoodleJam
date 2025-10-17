import { createRoomSchema } from "@repo/common";
import { prismaClient } from "@repo/db";
import express, { Request, Response, Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
const roomRouter: Router = express().router;

roomRouter.post("/", authMiddleware, async (req: Request, res: Response) => {
  const parsedData = createRoomSchema.safeParse(req.body);
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Login first",
    });
    return;
  }
  if (!parsedData.success) {
    res.status(403).json({
      success: false,
      message: parsedData.error.message,
    });
    return;
  }
  try {
    const existingRoom = await prismaClient.room.findFirst({
      where: {
        name: parsedData.data.name,
      },
    });
    if(existingRoom){
      res.status(402).json({
        success: true,
        message: `Room ${parsedData.data.name} already exist`,
      });
      return
    }
    const room = await prismaClient.room.create({
      data: {
        name: parsedData.data.name,
        adminId: userId,
      },
    });
    res.status(201).json({
      success: true,
      message: "successfully created",
      roomId: room.id,
    });
  } catch (error) {
    console.error(error);
    res.status(502).json({
      success: false,
      message: "Error while creating a room",
    });
  }
});

roomRouter.get("/:slug", async (req: Request, res: Response) => {
  const slug = req.params.slug;
  if (!slug) {
    res.status(403).json({
      success: false,
      message: "Provide slug",
    });
    return;
  }

  try {
    const room = await prismaClient.room.findFirst({
      where: {
        name: slug,
      },
    });
    if (!room) {
      res.status(404).json({
        success: false,
        message: "Room not found",
      });
      return;
    }
    res.status(200).json({
      success: false,
      message: "Room Info",
      room: room?.id,
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      success: false,
      message: "Error while Getting room info",
    });
  }
});

roomRouter.get("/", authMiddleware, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(403).json({
      message: "Unauthorized",
      success: false,
    });
  }

  const rooms = await prismaClient.room.findMany({
    where: {
      adminId: userId,
    },
  });
  res.json({
    rooms: rooms,
    message: rooms,
    success: true,
  });
});

export default roomRouter;
