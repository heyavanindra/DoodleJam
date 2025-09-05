import { JWT_SECRET } from "@repo/backend-common/config";
import { signupSchema, loginSchema } from "@repo/common/types";
import { prisma } from "@repo/db";
import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";

const authRoute: Router = express.Router();

authRoute.post("/signup", async (req: Request, res: Response) => {
  const parsedData = signupSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(502).json({
      success: false,
      message: "Wrong Inputs",
    });

    return;
  }

  try {
    const createdUser = await prisma.user.create({
      data: {
        email: parsedData.data.email,
        name: parsedData.data.name,
        username: parsedData.data.username,
        password: parsedData.data.password,
      },
    });

    if (!createdUser) {
      res.status(504).json({
        success: false,
        message: "Unable to create user",
      });
    }

    res.status(200).json({
      success: true,
      message: "User Created",
    });
  } catch (error) {
    console.log(error);
    res.status(403).json({
      success: false,
      message: "Error in signup route",
    });
  }
});

authRoute.post("/login", async (req: Request, res: Response) => {
  const data = req.body;
  const parsedData = loginSchema.safeParse(data);
  if (!parsedData.success) {
    console.log(parsedData.error.message)
    res .status(502).json({
        success: false,
        message: "Wrong Inputs",
      })
     ;
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: parsedData.data.username,
      },
    });

    if (!user || user.password != parsedData.data.password) {
      res
        .json({
          success: false,
          message: "Invalid username or password",
        })
        .status(401);
      return;
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res
      .json({
        success: true,
        token: token,
      })
      .status(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default authRoute;
