import { JWT_SECRET } from "@repo/backend-common/config";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export function middleware(req: Request, res: Response, next: NextFunction) {
  const headersToken = req.headers["authorization"] ?? "";
  const token = headersToken.split(" ")[1];
  if (!token) {
    res.json({
      message: "Wrong token",
      success: false,
    });
    return;
  }
  const decoded = jwt.verify(token, JWT_SECRET);
  if (!decoded) {
    res.status(401).json({ message: "Unauthorized", success: false });
    return;
  } else {
    req.userId = (decoded as JwtPayload).userId;
    next();
  }
}
