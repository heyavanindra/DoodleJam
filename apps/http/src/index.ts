import express, { Request, Response } from "express";
const app = express();

import authRoute from "./authRoute/auth";
import roomRouter from "./room/room"
import cors from "cors"
import chatRoute from "./chats/chats";
app.use(express.json());

app.use(cors())


const PORT = process.env.PORT || 4000

app.use("/auth",authRoute)
app.use("/room",roomRouter)
app.use("/chat",chatRoute)

app.get("/", async (req: Request, res: Response) => {
  res.send("hello world");
});

app.listen(PORT, async () => {
  console.log(`this app is listening on port ${PORT}`);
});