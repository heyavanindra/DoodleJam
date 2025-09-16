import { RefObject } from "react";
import api from "./api";

type ShapeTypeProps = {
  shapeType: "RECT" | "CIRCLE" | "LINE";
  shape: Shapes;
};

type Shapes = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
};

export async function renderCanvas({
  canvasRef,
  ws,
  roomId,
  shapeType,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  ws: WebSocket;
  roomId: string;
  shapeType: string;
}) {
  console.log("shapeType", shapeType);
  console.log("IN render funciton");
  // const ExistingShapes: ShapeTypeProps[] = await getExistingshapes({ roomId });
  const ExistingShapes: ShapeTypeProps[] = [];

  const canvas = canvasRef.current;
  if (!canvas) {
    return;
  }

  console.log("Canvas rendered");
  const ctx = canvasRef.current?.getContext("2d");
  if (!ctx) {
    return;
  }

  console.log("Got Context");

  let IsClicked = false;

  ws.onmessage = (Event) => {
    const message = JSON.parse(Event.data);
    console.log("Recieved Shape", Event.data);
    if (message.type === "chat") {
      const shapes = message.shape;
      const shapeType = message.shapeType;

      ExistingShapes.push({
        shapeType: shapeType,
        shape: shapes,
      });
      clearCanvar(ctx, canvas, ExistingShapes);
    }
  };

  clearCanvar(ctx, canvas, ExistingShapes);
  if (shapeType === "RECT") {
    let StartX = 0;
    let StartY = 0;
    console.log("RECT ke andar hu bc");
    canvas.addEventListener("mousedown", (e) => {
      IsClicked = true;
      StartX = e.clientX;
      StartY = e.clientY;
    });

    canvas.addEventListener("mouseup", (e) => {
      console.log("in here");
      IsClicked = false;
      const width = e.clientX - StartX;
      const height = e.clientY - StartY;
      const shape = {
        x: StartX,
        y: StartY,
        width: width,
        height: height,
      };
      ExistingShapes.push({
        shapeType: "RECT",
        shape: shape,
      });
      const message = {
        roomId: roomId,
        type: "chat",
        shapeType: shapeType,
        shape: shape,
      };

      console.log("sending....");
      ws.send(JSON.stringify(message));
    });

    canvas.addEventListener("mousemove", (e) => {
      if (IsClicked) {
        const Width = e.clientX - StartX;
        const Height = e.clientY - StartY;
        clearCanvar(ctx, canvas, ExistingShapes);
        ctx.strokeRect(StartX, StartY, Width, Height);
        ctx.strokeStyle = "rgba(255,255,255)";
      }
    });
  } else if (shapeType === "CIRCLE") {
    let StartX = 0;
    let StartY = 0;
    let radius = 0;
    IsClicked = false;
    canvas.addEventListener("mousedown", (e) => {
      IsClicked = true;
      ((StartX = e.clientX), (StartY = e.clientY));
    });
    canvas.addEventListener("mousemove", (e) => {
      if (IsClicked) {
        clearCanvar(ctx, canvas, ExistingShapes);
        const dx = e.clientX - StartX;
        const dy = e.clientY - StartY;
        radius = Math.sqrt(dx * dx + dy * dy);
        ctx.beginPath();

        ctx.arc(StartX, StartY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255)";
      }
    });

    canvas.addEventListener("mouseup", (e) => {
      IsClicked = false;
      const shapetype = "CIRCLE";
      const shape = {
        x: StartX,
        y: StartY,
        radius: radius,
      };
      ExistingShapes.push({
        shape: shape,
        shapeType: shapetype,
      });
    });
  }
}

function clearCanvar(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  ExistingShapes: ShapeTypeProps[],
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ExistingShapes.map((shapes, _) => {
    if (shapes.shapeType === "RECT") {
      ctx.strokeStyle = "rgba(255,255,255)";
      console.log(shapes);
      ctx.strokeRect(
        shapes.shape.x,
        shapes.shape.y,
        shapes.shape.width!,
        shapes.shape.height!,
      );
    } else if (shapes.shapeType === "CIRCLE") {
      ctx.beginPath();

      ctx.arc(
        shapes.shape.x,
        shapes.shape.y,
        shapes.shape.radius!,
        0,
        2 * Math.PI,
      );
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255)";
    }
  });
}

async function getExistingshapes({ roomId }: { roomId: string }) {
  const response = await api.get(`/shapes/${roomId}`);
  const res = response.data.shapes;

  const shapes = res.map(
    (data: {
      id: string;
      type: string;
      shapetype: string;
      data: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }) => {
      return data.data;
    },
  );
  return shapes;
}
