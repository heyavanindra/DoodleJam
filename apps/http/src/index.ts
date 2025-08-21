import express, { Request, Response } from "express";
const app = express();
import {JWT_SECRET} from "@repo/backend-common/config"
import { signupSchema } from "@repo/common/types";
import authRoute from "./authRoute/auth";
import roomRouter from "./room/room"
app.use(express.json());

const PORT = process.env.PORT || 4000

app.use("/auth",authRoute)
app.use("/room",roomRouter)

app.get("/", async (req: Request, res: Response) => {
  res.send("hello world");
});

app.listen(PORT, async () => {
  console.log(`this app is listening on port ${PORT}`);
});