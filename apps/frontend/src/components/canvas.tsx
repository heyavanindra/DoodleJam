"use client";

import { useSocket } from "@/hook/socket";
import CanvasComponent from "./CanvasComponent";
import { authClient } from "@repo/auth/client";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

type RoomCanvasTypes = {
  roomId: string;
};
const Canvas = ({ roomId }: RoomCanvasTypes) => {

 

  const { socket } = useSocket({ roomId });

  if (!socket) {
    return <div>Loading...</div>;
  }

  return <CanvasComponent roomId={roomId} ws={socket}></CanvasComponent>;
};

export default Canvas;
