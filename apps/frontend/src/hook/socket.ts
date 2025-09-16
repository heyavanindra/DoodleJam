import { useEffect, useState } from "react";

export const useSocket = ({token,roomId}:{
  token:string | undefined,
  roomId:string
}) => {
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000?token=${token}`);
    ws.onopen = () => {
      const join_room= {
        type:"join_room",
        roomId:roomId
      }
      ws.send(JSON.stringify(join_room));
    };
    setSocket(ws);
  }, []);
  return { socket };
};
