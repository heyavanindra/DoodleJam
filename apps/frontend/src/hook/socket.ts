import { authClient } from "@repo/auth/client";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
const WEB_SOCKET_URL = process.env.NEXT_PUBLIC_WEB_SOCKET_URL || "ws://localhost:8000"; 
export const useSocket = ({ roomId }: { roomId: string }) => {
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    let ws: WebSocket;
    
    const fetchTokenAndConnect = async () => {
      const res = await authClient.token();
      const userToken = res.data?.token;
      if (!userToken) {
        redirect("/login");
      }

      ws = new WebSocket(`${WEB_SOCKET_URL}?token=${userToken}`);
      console.log("connected");
      ws.onopen = () => {
        const join_room = { type: "join_room", roomId };
        console.log("1st sending join room request");
        ws.send(JSON.stringify(join_room));
      };

      setSocket(ws);
    };

    fetchTokenAndConnect();
    return () => {
      console.log("leaving room 1");
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log("leaving room 2");
        const leave_room = { type: "leave_room", roomId };
        ws.send(JSON.stringify(leave_room));
        setSocket(ws);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [roomId]);

  return { socket };
};
