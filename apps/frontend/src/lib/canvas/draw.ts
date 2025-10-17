import { v4 as uuidv4 } from "uuid";

import getExistingshapes from "../getExistingShapes";

type ShapeTypeProps = {
  id: string;
  shapeType: "RECT" | "CIRCLE" | "PENCIL";
  shape: Shapes;
};

type Shapes = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: { x: number; y: number }[];
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
  private selectedTool: "RECT" | "CIRCLE" | "PENCIL" | "POINTER" | "ERASER" = "RECT";
  private lineWidth: number;
  private canvasOffsetx: number;
  private canvasOffsety: number;
  private currentPencilPoints: { x: number; y: number }[] = [];
  private selectedElement: ShapeTypeProps | null;
  private offSetX;
  private offSetY;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;
    this.existingShape = [];
    this.isClicked = false;
    this.startX = 0;
    this.startY = 0;
    this.init();
    this.initMouseEventHandlers();
    this.initHandlers();
    this.lineWidth = 1;
    this.canvasOffsetx = canvas.offsetLeft;
    this.canvasOffsety = canvas.offsetTop;
    this.canvas.width = window.innerWidth - this.canvasOffsetx;
    this.canvas.height = window.innerHeight - this.canvasOffsety;
    this.selectedElement = null;
    this.offSetX = 0;
    this.offSetY = 0;
  }

  async init() {
    this.existingShape = await getExistingshapes(this.roomId);
  }

  setShape(tool: "PENCIL" | "CIRCLE" | "RECT" | "POINTER" | "ERASER") {
    this.selectedTool = tool;
    this.ctx.beginPath();
  }

  drawLine(points: { x: number; y: number }[]) {
    if (points.length < 2) return;
    this.ctx.beginPath();
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.lineCap = "round";
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    this.ctx.stroke();
  }

  private mouseDown = (e: MouseEvent) => {
    this.isClicked = true;
    this.startX = e.offsetX;
    this.startY = e.offsetY;
    if (this.selectedTool === "PENCIL") {
      console.log("New path set");
      console.log("start line x", this.startX, "start line y ", this.startY);
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
    } else if (this.selectedTool === "POINTER") {
      // calculate offset possition
      const element = this.getElementPosition(e);
      if (element) {
        this.selectedElement = element;
        this.offSetX = e.offsetX - this.selectedElement?.shape.x;
        this.offSetY = e.clientY - this.selectedElement.shape.y;
      }
    } 
  };

  private mouseMove = (e: MouseEvent) => {
    if (!this.isClicked) return;

    const width = e.offsetX - this.startX;
    const height = e.offsetY - this.startY;

    this.clearCanvas();
    this.ctx.strokeStyle = "rgba(255,255,255,1)";

    if (this.selectedTool === "RECT") {
      this.ctx.strokeRect(this.startX, this.startY, width, height);
    } else if (this.selectedTool === "CIRCLE") {
      const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
      const centerX = this.startX + width / 2;
      const centerY = this.startY + height / 2;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (this.selectedTool === "PENCIL") {
      this.currentPencilPoints.push({
        x: e.offsetX,
        y: e.offsetY,
      });
      this.drawLine(this.currentPencilPoints);
    } else if (this.selectedTool === "POINTER") {
      this.updateElement(e);
      this.clearCanvas();
    }else if(this.selectedTool === "ERASER"){
       const element = this.getElementPosition(e);
       if(element){
         this.selectedElement = element
         this.removeElement()
       }
       
    }
  };
  
  private removeElement() {
    const index = this.existingShape.findIndex(ele=> ele.id === this.selectedElement?.id)\
    this.existingShape.splice(index,1)
    this.clearCanvas()
  }

  private updateElement(e: MouseEvent) {
    if (this.selectedElement) {
      const { shape, shapeType } = this.selectedElement;
      const { x, y, height, width } = shape;
      const ele = this.existingShape.find(
        (u) => u.id === this.selectedElement?.id,
      );
      if (ele) {
        ele.shape.x = e.offsetX - this.offSetX;

        ele.shape.y = e.clientY - this.offSetY;

        console.log("exsisting shapes after moving", this.existingShape);
        this.clearCanvas();
      }
    }
  }

  private mouseUp = (e: MouseEvent) => {
    console.log("selected Tool", this.selectedTool);

    if (!this.isClicked) return;
    this.isClicked = false;

    const width = e.offsetX - this.startX;
    const height = e.offsetY - this.startY;
    if (this.selectedTool === "RECT") {
      const shape: Shapes = {
        x: this.startX,
        y: this.startY,
        width,
        height,
      };

      this.existingShape.push({
        id: uuidv4(),
        shapeType: this.selectedTool,
        shape,
      });

      const message = {
        roomId: this.roomId,
        type: "chat",
        shapeType: this.selectedTool,
        shape,
      };
      console.log(message);
      this.socket.send(JSON.stringify(message));
    } else if (this.selectedTool === "CIRCLE") {
      const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
      const centerX = this.startX + width / 2;
      const centerY = this.startY + height / 2;
      const shape: Shapes = {
        x: centerX,
        y: centerY,
        radius,
        width,
        height,
      };

      this.existingShape.push({
        id: uuidv4(),
        shapeType: this.selectedTool,
        shape,
      });

      const message = {
        roomId: this.roomId,
        type: "chat",
        shapeType: this.selectedTool,
        shape,
      };
      // this.ctx.beginPath();
      console.log(message);
      this.socket.send(JSON.stringify(message));
    } else if (this.selectedTool === "PENCIL") {
      this.existingShape.push({
        id: uuidv4(),
        shapeType: "PENCIL",
        shape: {
          x: 0,
          y: 0,
          points: this.currentPencilPoints,
        },
      });
      this.currentPencilPoints = [];
    } else if (this.selectedTool === "POINTER") {
      console.log("this", this.selectedElement);
      this.selectedElement = null;
    }
  };

  private initMouseEventHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDown);
    this.canvas.addEventListener("mousemove", this.mouseMove);
    this.canvas.addEventListener("mouseup", this.mouseUp);
  }

  private initHandlers() {
    this.socket.onmessage = (Event) => {
      const message = JSON.parse(Event.data);
      if (message.type === "chat") {
        this.existingShape.push({
          id: uuidv4(),

          shapeType: message.shapeType,
          shape: message.shape,
        });
        this.clearCanvas();
      }
    };
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.existingShape.forEach((shapes) => {
      this.ctx.strokeStyle = "rgba(255,255,255,1)";
      if (shapes.shapeType === "RECT") {
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
          Math.PI * 2,
        );
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shapes.shapeType === "PENCIL" && shapes.shape.points) {
        this.drawLine(shapes.shape.points);
      }
    });
  }
  distroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDown);
    this.canvas.removeEventListener("mouseup", this.mouseUp);
    this.canvas.removeEventListener("mousemove", this.mouseMove);
  }

  // moving element logic

  private isWithInElement(e: MouseEvent, ele: ShapeTypeProps) {
    const { shapeType } = ele;
    const { x, y, radius, height, points, width } = ele.shape;

    switch (shapeType) {
      case "RECT": {
        const minX = Math.min(x, x + Number(width));
        const minY = Math.min(y, y + Number(height));
        const maxX = Math.max(x, x + Number(width));
        const maxY = Math.max(y, y + Number(height));
        return (
          e.offsetX > minX &&
          e.offsetX <= maxX &&
          e.clientY >= minY &&
          e.clientY <= maxY
        );
      }
      case "CIRCLE": {
        const centerX = e.offsetX - x
        const centerY = e.offsetY - y
        const d = centerX * centerX + centerY * centerY
        
        return d <= Number(radius) * Number(radius)
      }
      case "PENCIL": {
        return false;
      }
    }
  }

  private getElementPosition(e: MouseEvent) {
    return this.existingShape.find((ele) => {
      const iswithinElement = this.isWithInElement(e, ele);
      return iswithinElement;
    });
  }
}

const user = {
  id: "piHd4gp0bbWDE0U0oP1xV",
  type: "line",
  x: 2860.1860377813923,
  y: -1432.3981314259613,
  width: 437.47233296154263,
  height: 367.7098798037907,
  angle: 0,
  strokeColor: "#1e1e1e",
  backgroundColor: "transparent",
  fillStyle: "hachure",
  strokeWidth: 4,
  strokeStyle: "solid",
  roughness: 1,
  opacity: 100,
  groupIds: [],
  frameId: null,
  index: "aD",
  roundness: {
    type: 2,
  },
  seed: 553229285,
  version: 202,
  versionNonce: 1161253093,
  isDeleted: false,
  boundElements: null,
  updated: 1760383754001,
  link: null,
  locked: false,
  points: [
    [0, 0],
    [437.47233296154263, 367.7098798037907],
  ],
  lastCommittedPoint: null,
  startBinding: null,
  endBinding: null,
  startArrowhead: null,
  endArrowhead: null,
  polygon: false,
};
