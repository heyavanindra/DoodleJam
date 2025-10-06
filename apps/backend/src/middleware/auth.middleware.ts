import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";
import { auth } from "@repo/auth/server";
import { fromNodeHeaders } from "better-auth/node";
export default async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session || !session.user) {
      return res.status(403).json({
        message: "unAuthenticated",
      });
    }
    req.userId = session.user.id;
    next();
  } catch(err) {
    console.error("Error in auth middleware:", err);
    res.status(500).json({ error: "Internal error" });
  }
}
