import { loginSchema, signupSchema } from "@repo/common";
import { prismaClient } from "@repo/db";
import express, { Response, Request, Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authMiddleware from "../../middleware/auth.middleware";
import { JWT_SECRET } from "@repo/backend-common";

const authRouter: Router = express().router;

authRouter.post("/signup", async (req: Request, res: Response) => {
  const parsedData = signupSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(402).json({
      success: false,
      message: parsedData.error.message,
    });
    return;
  }
  const { username, email, password, name } = parsedData.data;
  try {
    const existUsername = await prismaClient.user.findFirst({
      where: {
        username: parsedData.data.username,
      },
    });
    if (existUsername) {
      res.status(501).json({
        success: false,
        message: "Username Already Exist",
      });
      return;
    }
    const hasedPassword = await bcrypt.hash(parsedData.data.password, 10);
    await prismaClient.user.create({
      data: {
        username: username,
        password: hasedPassword,
        name: name,
        email: email,
      },
    });
    res.status(201).json({
      success: true,
      message: "user created",
    });
  } catch {
    res.status(501).json({
      success: false,
      message: "Error while signing up",
    });
  }
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const parsedData = loginSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(405).json({
      success: false,
      message: parsedData.error.message,
    });
    return;
  }
  try {
    const doesExists = await prismaClient.user.findFirst({
      where: {
        username: parsedData.data.username,
      },
    });

    if (!doesExists) {
      res.status(502).json({
        success: false,
        message: "Wrong Password Or username",
      });
      return;
    }
    const success = await bcrypt.compare(
      parsedData.data.password,
      doesExists.password,
    );
    if (!success) {
      res.status(404).json({
        success: false,
        message: "Wrong Password Or username",
      });
    }

    const token = jwt.sign({ userId: doesExists.id }, JWT_SECRET);

    res
      .cookie("auth", token, {})
      .status(200)
      .json({ success: true, message: "Logged in" });
  } catch {
    res.status(504).json({
      success: false,
      message: "Error while loginin in",
    });
  }
});

authRouter.get("/me", authMiddleware, async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(403).json({
      success: false,
      message: "Login first",
    });
  }

  try {
    const userDetails = await prismaClient.user.findFirst({
      where: {
        id: userId,
      },
    });
    res.status(201).json({
      success: true,
      message: "Get message",
      user: userDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(503).json({
      success: false,
      message: "error while fetching data",
    });
  }
});

export default authRouter;
