"use client";

import { useSocket } from "@/hook/socket";
import Cookies from "js-cookie";
import CanvasComponent from "./CanvasComponent";

type RoomCanvasTypes = {
  roomId: string;
};
const Canvas = ({ roomId }: RoomCanvasTypes) => {
  const token = Cookies.get("auth");
  const { socket } = useSocket({ token, roomId });

  if (!socket) {
    console.log(socket);
    return <div>Loading...</div>;
  }

  return (
    <CanvasComponent roomId={roomId} ws={socket}></CanvasComponent>
  );
};

export default Canvas;
