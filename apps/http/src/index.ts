import express, { Request, Response } from "express";
import { prisma } from "@repo/db";
const app = express();
import {JWT_SECRET} from "@repo/backend-common/config"
import { signupSchema } from "@repo/common/types";
import authRoute from "./authRoute/auth";

app.use(express.json());


app.use("/auth",authRoute)

app.get("/", async (req: Request, res: Response) => {
  res.send("hello world");
});

app.listen(3000, async () => {
  console.log("this app is listening on port 3000");
});
