"use client"

import React, { useEffect, useRef } from "react";
import { RenderCanvasShapes } from "../utils/canvas";

const RoomCanvas = ({
  roomId,
  socket
}: {
  roomId: string;
  socket:WebSocket
}) => {
      const canvasRef = useRef<HTMLCanvasElement>(null);

    
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      RenderCanvasShapes(canvasRef.current, roomId,socket);
    }
  }, [canvasRef, roomId]);
  return <canvas className="bg-black" ref={canvasRef}></canvas>;
};

export default RoomCanvas;
