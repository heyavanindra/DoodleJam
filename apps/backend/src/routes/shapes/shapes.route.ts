import express, { Request, Response, Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { prismaClient } from "@repo/db";

const shapesRoute: Router = express().router;

shapesRoute.get(
  "/:roomId",
  authMiddleware,
  async (req: Request, res: Response) => {
    const roomId = Number(req.params.roomId);
    try {
      const shapes = await prismaClient.room.findMany({
        where: {
          id: roomId,
        },
      });
      res.status(200).json({
        success: false,
        shape: shapes,
        message: "shapes found",
      });
    } catch (error) {
      res.status(501).json({
        success: false,
        message: "shapes not found",
      });
    }
  },
);

export default shapesRoute;
