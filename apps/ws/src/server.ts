import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
const server = createServer();
import { userQueue } from "@repo/queue";
import { createRemoteJWKSet, jwtVerify } from "jose";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 8000;

const wsServer = new WebSocketServer({ server });

async function validateToken(token: string) {
  try {
    const JWKS = createRemoteJWKSet(
      new URL(`${process.env.AUTH_URL}/api/auth/jwks`)
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

  ws.on("close", () => {
    User = User.filter((x) => x.ws !== ws);
  });

  ws.on("message", (data) => {
    const parsedData = JSON.parse(data.toString());
    if (parsedData.type === "join_room") {
      const user = User.find((x) => x.ws === ws);
      user?.roomId.push(parsedData.roomId);
      return;
    }

    if (parsedData.type === "leave_room") {
      const user = User.find((x) => x.ws === ws);
      if (!user) {
        return;
      }
      user.roomId = user.roomId.filter((x) => x !== parsedData.roomId);
    }

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const shape = parsedData.message;
      User.map((user, _) => {
        if (user.roomId == roomId && user.ws != ws) {
          user.ws.send(JSON.stringify(parsedData));
        }
      });
      userQueue.add("shapesQueue", {
        shapes: shape,
        roomId: roomId,
        shapeAction: "CREATE",
      });
    } else if (parsedData.type === "update_message") {
      const roomId = parsedData.roomId;
      User.map((user, _) => {
        if (user.roomId.includes(roomId) && user.ws != ws) {
          user.ws.send(JSON.stringify(parsedData));
        }
      });
      userQueue.add("shapeQueue", {
        roomId: roomId,
        shapes: JSON.stringify({ id: parsedData.messageId, shape: parsedData }),
        shapeAction: "UPDATE",
      });
      // userQueue.add("shapesQueue", {
      //   roomId: roomId,
      //   shapes: JSON.stringify({ id: parsedData.messageId ,shape:parsedData. }),
      //   shapeAction: "UPDATE",
      // });
    } else if (parsedData.type === "delete_message") {
      const roomId = parsedData.roomId;
      User.map((user, _) => {
        if (user.roomId.includes(roomId) && user.ws != ws) {
          user.ws.send(JSON.stringify(parsedData));
        }
      });
      userQueue.add("shapeQueue", {
        roomId: roomId,
        shapes: JSON.stringify({ id: parsedData.messageId, shape: parsedData }),
        shapeAction: "DELETE",
      });
      // userQueue.add("shapesQueue", {
      //   roomId: roomId,
      //   shapes: JSON.stringify({ id: parsedData.messageId ,shape:parsedData. }),
      //   shapeAction: "UPDATE",
      // });
    }
  });
});

server.listen(8000, () => {
  console.log("Server is Running on port 8000");
});
