import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth/auth.route";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import shapesRoute from "./routes/shapes/shapes.route";
import roomRouter from "./routes/room/room.route";
import { toNodeHandler } from "better-auth/node";
const app = express();
import { auth } from "@repo/auth/server";
const port = process.env.PORT || 4000;
dotenv.config();
app.use(
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use(cookieParser());

app.get("/", async (req, res) => {
  res.send("Hello, World!");
});

// app.use("/auth",authRouter)
app.use("/room", roomRouter);
app.use("/shapes", shapesRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
