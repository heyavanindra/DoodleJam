import express, { Request, Response } from "express";

const app = express();

app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
  res.send("hello world");
});

app.listen(3000, async () => {
  console.log("this app is listening on port 3000");
});
