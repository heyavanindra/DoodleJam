"use client";
import { DRAW } from "@/lib/canvas/draw";
import { cn } from "@/lib/utils";
import {
  Circle,
  Eraser,
  Pencil,
  Pointer,
  RectangleHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type CanvasItems = "RECT" | "CIRCLE" | "PENCIL" | "POINTER" | "ERASER";

const CanvasComponent = ({ roomId, ws }: { roomId: string; ws: WebSocket }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<DRAW>();
  const [shapeType, setShapeType] = useState<CanvasItems>("RECT");

  useEffect(() => {
    canvas?.setShape(shapeType);
  }, [shapeType, canvas]);

  useEffect(() => {
    if (canvasRef.current) {
      console.log("mount");

      const canv = new DRAW(canvasRef.current, roomId, ws);
      setCanvas(canv);
      return () => {
        console.log("unmount");
        console.log("clear first canvas");
        canv.distroy();
      };
    }
  }, []);

  return (
    <section className="relative">
      <div className="absolute flex top-3 left-1/2 -translate-x-1/2 p-3 bg-neutral-600 rounded-2xl gap-x-8 text-neutral-200">
        <Pencil
          className={cn("cursor-pointer", {
            "text-red-500": shapeType === "PENCIL",
          })}
          onClick={() => setShapeType("PENCIL")}
        ></Pencil>
        <Circle
          className={cn("cursor-pointer", {
            "text-red-500": shapeType === "CIRCLE",
          })}
          onClick={() => setShapeType("CIRCLE")}
        ></Circle>
        <RectangleHorizontal
          className={cn("cursor-pointer", {
            "text-red-500": shapeType === "RECT",
          })}
          onClick={() => setShapeType("RECT")}
        ></RectangleHorizontal>
        <Pointer
          className={cn("cursor-pointer", {
            "text-red-500": shapeType === "POINTER",
          })}
          onClick={() => setShapeType("POINTER")}
        ></Pointer>
        <Eraser
          className={cn("cursor-pointer", {
            "text-red-500": shapeType === "ERASER",
          })}
          onClick={() => setShapeType("ERASER")}
        ></Eraser>
      </div>
      <canvas
        ref={canvasRef}
        width={1800}
        height={800}
        style={{
          backgroundColor: "black",
        }}
      ></canvas>
    </section>
  );
};

export default CanvasComponent;
