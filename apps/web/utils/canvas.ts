import axios from "axios";
import Cookies from "js-cookie";
import { BACKEND_URL } from "../app/config";

type Shapes = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const CurrentShapes: Shapes[] = [];

export function RenderCanvasShapes(canvasRef: HTMLCanvasElement) {
  const canvas = canvasRef;

  const ctx = canvas.getContext("2d");
  let ShapeX = 0;
  let ShapeY = 0;
  if (!ctx) {
    return;
  }

  let clicked: boolean = false;

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    ShapeX = e.clientX;
    ShapeY = e.clientY;
  });

  canvas.addEventListener("mouseup", (e) => {
    const width = e.clientX - ShapeX;
    const height = e.clientY - ShapeY;
    CurrentShapes.push({
      x: ShapeX,
      y: ShapeY,
      height,
      width,
    });
    clicked = false;
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
  return res.data.message
}
