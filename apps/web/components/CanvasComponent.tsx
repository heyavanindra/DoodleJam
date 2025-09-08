"use client";

import React, { useEffect, useState } from "react";
import { WEBSOCKET_URL } from "../app/config";
import Cookies from "js-cookie";
import RoomCanvas from "./RoomCanvas";


const CanvasComponent = ({ roomId }: { roomId: string }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    const ws = new WebSocket(`${WEBSOCKET_URL}?token=${token}`);

    ws.onopen = () => {
      setSocket(ws);
      ws.send(JSON.stringify({
        type:"join_room",
        roomId:roomId
      }))
    };
  }, []);


  if (!socket) {
    return (
      <div className="absolute inset-0 h-screen w-full items-center justify-center bg-black text-center text-9xl">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="">
        <RoomCanvas socket={socket}  roomId={roomId}></RoomCanvas>
      </div>
    </>
  );
};

export default CanvasComponent;
