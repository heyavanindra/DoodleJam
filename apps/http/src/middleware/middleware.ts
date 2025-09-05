import { JWT_SECRET } from "@repo/backend-common/config";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export function middleware(req: Request, res: Response, next: NextFunction) {
  const headersToken = req.headers["authorization"] ?? "";
  console.log(headersToken,"header token")
  const token = headersToken.split(" ")[1];
  if (!token) {
    res.json({
      message: "Wrong token",
      success: false,
    });
    return;
  }
  console.log(token)
 try {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload; 
  if (!decoded) {
    res.status(403).json({
      message:"unauthorized"
    })
    return;
  }
  req.userId = decoded.userId 
  if (!decoded) {
    res.status(401).json({ message: "Unauthorized", success: false });
    return;
  } else {
    req.userId = (decoded as JwtPayload).userId;
    next();
  }
 } catch (error) {
  console.error(error)
  res.status(500).json({
    message:"Wrong token"
  })
  return
 }
}
