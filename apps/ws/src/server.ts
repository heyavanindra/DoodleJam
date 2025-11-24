import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
const server = createServer();
import { userQueue } from "@repo/queue";
import { createRemoteJWKSet, jwtVerify } from "jose";
import dotenv from "dotenv";

dotenv.config();

const wsServer = new WebSocketServer({ server });

async function validateToken(token: string) {
  try {
    const JWKS = createRemoteJWKSet(
      new URL(`${process.env.BETTER_AUTH_URL}/api/auth/jwks`),
    );

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: process.env.BETTER_AUTH_URL,
      audience: process.env.BETTER_AUTH_URL,
    });
    return payload;
  } catch (error) {
    console.error("Token validation failed:", error);
    throw error;
  }
}

type UserProps = {
  ws: WebSocket;
  roomId: string[];
  userId: string;
};

let User: UserProps[] = [];

wsServer.on("connection", async (ws, req) => {
  const token = req.url?.split("token=")[1];
  if (!token) {
    ws.close();
    return;
  }
  const userId = await validateToken(token);
  User.push({
    userId: String(userId.id),
    roomId: [],
    ws: ws,
  });
  console.log("connection done");
  ws.on("message", (data) => {
    console.log("in here");
    const parsedData = JSON.parse(data.toString());
    if (parsedData.type === "join_room") {
      console.log("joining room");
      console.log(parsedData);

      const user = User.find((x) => x.ws === ws);
      user?.roomId.push(parsedData.roomId);
      console.log(user?.userId);
      return;
    }

    if (parsedData.type === "leave_room") {
      console.log("leaving room");
      const foundUser = User.find((x) => x.ws === ws);
      if (!foundUser) {
        return;
      }
      User = User.filter((x) => x.roomId === foundUser.roomId);
    }

    if (parsedData.type === "chat") {
      console.log("sending data");
      const roomId = parsedData.roomId;
      const shape = parsedData.message;
      console.log(JSON.parse(parsedData.message));
      User.map((user, _) => {
        if (user.roomId == roomId && user.ws != ws) {
          user.ws.send(JSON.stringify(parsedData));
          userQueue.add("shapesQueue", {
            shapes: shape,
            roomId: roomId,
            shapeAction: "CREATE",
          });
        }
      });
    } else if (parsedData.type === "delete_message") {
      console.log("deleting");
      console.log("")
      const roomId = parsedData.roomId;
      User.map((user, _) => {
        if (user.roomId == roomId && user.ws != ws) {
          user.ws.send(JSON.stringify(parsedData));
        }
      });
      userQueue.add("shapesQueue", {
        roomId: roomId,
        id: parsedData.messageId,
      });
    }
  });
});

server.listen(8000, () => {
  console.log("Server is Running on port 8000");
});
