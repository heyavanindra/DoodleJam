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
      ws.onopen = () => {
        const join_room = { type: "join_room", roomId };
        ws.send(JSON.stringify(join_room));
      };

      setSocket(ws);
    };

    fetchTokenAndConnect();
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
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
