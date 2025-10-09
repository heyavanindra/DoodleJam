import { authClient } from "@repo/auth/client";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export const useSocket = ({ roomId }: { roomId: string }) => {
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    const fetchTokenAndConnect = async () => {
      const res = await authClient.token();
      const userToken = res.data?.token;
      if (!userToken) {
        redirect("/login");
      }

      const ws = new WebSocket(`ws://localhost:8000?token=${userToken}`);
console.log("connected")
      ws.onopen = () => {
        const join_room = { type: "join_room", roomId };
        console.log("1st sending join room request")
        ws.send(JSON.stringify(join_room));
      };

      setSocket(ws);

      ws.onclose = () => {
        console.log("ws closed");
      };

      return () => ws.close();
    };

    fetchTokenAndConnect();
  }, [roomId]);

  return { socket };
};
