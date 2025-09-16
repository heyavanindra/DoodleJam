"use client";
import { renderCanvas } from "@/lib/canvas";
import { Circle, Pencil, RectangleHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";



type CanvasItems = "RECT" | "CIRCLE" | "PENCIL"


const CanvasComponent = ({ roomId, ws }: { roomId: string; ws: WebSocket }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shapeType , setShapeType] = useState<CanvasItems>("RECT")

  useEffect(() => {
    console.log("Canvas element:", canvasRef.current);
    if (!canvasRef.current) {
      return;
    }
    canvasRef.current.width = window.innerWidth
    canvasRef.current.height = window.innerHeight
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    renderCanvas({ canvasRef, ws, roomId ,shapeType});
  }, [canvasRef, roomId,shapeType]);

  return (
    <section className="relative">
      <div className="absolute flex top-3 left-1/2 -translate-x-1/2 p-3 bg-neutral-600 rounded-2xl gap-x-8 text-neutral-200">
        <Pencil className="cursor-pointer" onClick={()=> setShapeType("PENCIL")}></Pencil>
        <Circle className="cursor-pointer" onClick={()=> setShapeType("CIRCLE")}></Circle>
        <RectangleHorizontal className="cursor-pointer" onClick={()=> setShapeType("RECT")}></RectangleHorizontal>
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
