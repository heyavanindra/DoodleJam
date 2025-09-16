import { createServer, IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";
const server = createServer();
import { userQueue } from "@repo/queue";

const wsServer = new WebSocketServer({ server });

function isAuthenticated(ws: WebSocket, token: string) {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
  if (!decoded) {
    ws.close();
    return;
  }
  return decoded.userId;
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
  const userId = isAuthenticated(ws, token);
  User.push({
    userId: String(userId),
    roomId: [],
    ws: ws,
  });

  ws.on("message", (data) => {
    const parsedData = JSON.parse(data.toString());
    if (parsedData.type === "join_room") {
      const user = User.find((x) => x.ws === ws);
      user?.roomId.push(parsedData.roomId);
      console.log(user?.userId);
      return;
    }

    if (parsedData.type === "leave_room") {
      const foundUser = User.find((x) => x.ws === ws);
      if (!foundUser) {
        return;
      }
      User = User.filter((x) => x.roomId === foundUser.roomId);
    }

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const shape = parsedData.shape;
      User.map((user, _) => {
        if (user.roomId == roomId && user.ws != ws) {
          const data = {
            type: "chat",
            roomId: roomId,
            shape: shape,
          };
          user.ws.send(JSON.stringify(data));
          userQueue.add("shapesQueue", {
            shapes: shape,
            roomId: roomId,
          });
        }
      });
    }
  });
});

server.listen(8000, () => {
  console.log("Server is Running on port 8000");
});
