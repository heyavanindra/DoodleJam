import { FileJson } from "lucide-react";
import getExistingshapes from "../getExistingShapes";

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

export class DRAW {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShape: ShapeTypeProps[];
  private roomId: string;
  private socket: WebSocket;
  private isClicked: boolean;
  private startX: number;
  private startY: number;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.init();
    this.roomId = roomId;
    this.existingShape = [];
    this.socket = socket;
    this.initMouseEventHandlers()
    this.isClicked = false
    this.startX = 0
    this.startY = 0
  }
  async init() {
    this.existingShape = await getExistingshapes(this.roomId);
    

  }
  initMouseEventHandlers(){
    this.canvas.addEventListener("mousedown",(e)=>{
      this.isClicked = true
      this.startX = e.clientX
      this.startY = e.clientY

    })
  }
  initHandlers() {
    this.socket.onmessage = (Event) => {
      const message = JSON.parse(Event.data);
      if (message.type === "chat") {
        const shapes = message.shape;
        const shapeType = message.shapeType;

        this.existingShape.push({
          shapeType: shapeType,
          shape: shapes,
        });
        this.clearCanvas();
      }
    };
  }

  clearCanvas(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.existingShape.map((shapes, _) => {
      if (shapes.shapeType === "RECT") {
        this.ctx.strokeStyle = "rgba(255,255,255)";
        console.log(shapes);
        this.ctx.strokeRect(
          shapes.shape.x,
          shapes.shape.y,
          shapes.shape.width!,
          shapes.shape.height!,
        );
      } else if (shapes.shapeType === "CIRCLE") {
        this.ctx.beginPath();

        this.ctx.arc(
          shapes.shape.x,
          shapes.shape.y,
          shapes.shape.radius!,
          0,
          2 * Math.PI,
        );
        this.ctx.stroke();
        this.ctx.strokeStyle = "rgba(255,255,255)";
      }
  }
}
