import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import {JWT_SECRET} from "@repo/backend-common"

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies.auth;
  console.log("token",token)
  if (!token) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }
  try {

    
    const decoded = jwt.verify(token,JWT_SECRET) as JwtPayload;
    console.log("decoded",decoded)
    if (!decoded) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }
    req.userId = (decoded as JwtPayload).userId;
    next();
  } catch (error) {
    console.error(error);
    res.status(502).json({
      success: false,
      message: "Invalid token",
    });
  }
}
