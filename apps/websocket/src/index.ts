import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/db";

type Users = {
  authenticatedUserId: string;
  ws: WebSocket;
  rooms: string[];
};

const users: Users[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string") {
      return null;
    }
    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch (error) {
    console.error(error);
    return null;
  }
}

const wss = new WebSocketServer({ port: 8080 });
wss.on("connection", function connection(ws, request) {
const url = request.url;
if (!url) {
  return;
  }
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") ?? "";
  const authenticatedUserId = checkUser(token);
  if (authenticatedUserId == null) {
    ws.close();
    return;
  }

  users.push({
    authenticatedUserId,
    rooms: [],
    ws,
  });

  ws.on("message", async function message(data) {
    const parsedData = JSON.parse(data as unknown as string);
    if (parsedData.type == "join_room") {
      const user = users.find((x) => x.ws === ws);
      user?.rooms.push(parsedData.roomId);
    }
    if (parsedData.type === "leave_room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user.rooms.filter((x) => x === parsedData.roomId);
    }
    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message: message,
              roomId,
            })
          );
        }
      });
      try {
        await prisma.chat.create({
          data: {
            roomId,
            message,
            userId: authenticatedUserId,
          },
        });
      } catch (error) {
        console.error(error);
      }
    }
  });

  ws.send("something");
});
