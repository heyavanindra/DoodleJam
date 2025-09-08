import axios from "axios";
import Cookies from "js-cookie";
import { BACKEND_URL } from "../app/config";

type Shapes = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export async function RenderCanvasShapes(
  canvasRef: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket,
) {
  const canvas = canvasRef;

  const CurrentShapes: Shapes[] = await getExistingShapes(roomId);

  const ctx = canvas.getContext("2d");
  let ShapeX = 0;
  let ShapeY = 0;

  if (!ctx) {
    return;
  }

  socket.onmessage = (Event) => {
    const message = JSON.parse(Event.data);

    if (message.type === "chat") {
      const parsedShape = JSON.parse(message.message);
      CurrentShapes.push(parsedShape);
      clearCanvas(CurrentShapes, canvas, ctx);
    }
  };

  clearCanvas(CurrentShapes, canvas, ctx);

  let clicked: boolean = false;

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    ShapeX = e.clientX;
    ShapeY = e.clientY;
  });

  canvas.addEventListener("mouseup", (e) => {
    clicked = false;
    const width = e.clientX - ShapeX;
    const height = e.clientY - ShapeY;
    const shape = {
      x: ShapeX,
      y: ShapeY,
      height,
      width,
    };
    CurrentShapes.push(shape);
    socket.send(
      JSON.stringify({
        type: "chat",
        roomId:roomId,
        message: JSON.stringify(shape),
      }),
    );
  });
  canvas.addEventListener("mousemove", (e) => {
    if (clicked) {
      const Height = e.clientY - ShapeY;
      const Width = e.clientX - ShapeX;
      clearCanvas(CurrentShapes, canvas, ctx);
      ctx.strokeRect(ShapeX, ShapeY, Width, Height);
    }
  });
}

function clearCanvas(
  exsistingShapes: Shapes[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  exsistingShapes.map((shape) => {
    ctx.strokeStyle = "rgba(255,255,255)";
    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
  });
}

async function getExistingShapes(roomId: string) {
  const token = Cookies.get("token");
  const res = await axios.get(`${BACKEND_URL}/chat/${roomId}`, {
    headers: {
      Authorization: token,
    },
  });
  const message = res.data.message;

  const shapes = message.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData;
  });
  return shapes;
}
