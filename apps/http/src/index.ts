import express, { Request, Response } from "express";
import { prisma } from "@repo/db";
const app = express();
import {JWT_SECRET} from "@repo/backend-common/config"

app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
  res.send("hello world");
});

app.listen(3000, async () => {
  console.log("this app is listening on port 3000");
});
