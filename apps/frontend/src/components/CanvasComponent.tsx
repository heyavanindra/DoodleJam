"use client";
import { DRAW } from "@/lib/canvas/draw";
import { Circle, Pencil, RectangleHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type CanvasItems = "RECT" | "CIRCLE" | "pencil";

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
          className="cursor-pointer"
          onClick={() => setShapeType("pencil")}
        ></Pencil>
        <Circle
          className={`cursor-pointer${shapeType === "CIRCLE" ? "text-red-600" : "text-neutral-500"}`}
          onClick={() => setShapeType("CIRCLE")}
        ></Circle>
        <RectangleHorizontal
          className="cursor-pointer"
          onClick={() => setShapeType("RECT")}
        ></RectangleHorizontal>
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
