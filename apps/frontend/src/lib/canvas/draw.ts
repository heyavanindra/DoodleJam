import getExistingshapes from "../getExistingShapes";

type ShapeTypeProps = {
  shapeType: "RECT" | "CIRCLE" | "pencil";
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
  private selectedTool: "RECT" | "CIRCLE" | "pencil" = "RECT";

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
  }

  async init() {
    this.existingShape = await getExistingshapes(this.roomId);
  }

  setShape(tool: "pencil" | "CIRCLE" | "RECT") {
    this.selectedTool = tool;
  }

  private mouseDown = (e: MouseEvent) => {
    this.isClicked = true;
    this.startX = e.offsetX;
    this.startY = e.offsetY;
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
    }
  };

  private mouseUp = (e: MouseEvent) => {
    console.log("selected Tool",this.selectedTool)
    
    if (!this.isClicked) return;
    this.isClicked = false;

    const width = e.offsetX - this.startX;
    const height = e.offsetY - this.startY;
    if(this.selectedTool==="RECT"){
      const shape: Shapes = {
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    
      this.existingShape.push({
        shapeType: this.selectedTool,
        shape,
      });
      
      const message = {
        roomId: this.roomId,
        type: "chat",
        shapeType: this.selectedTool,
        shape,
      };
      console.log(message)
      this.socket.send(JSON.stringify(message));
    }else if (this.selectedTool==="CIRCLE"){
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
        shapeType: this.selectedTool ,
        shape,
      });
      
      const message = {
        roomId: this.roomId,
        type: "chat",
        shapeType: this.selectedTool,
        shape,
      };
      console.log(message)
      this.socket.send(JSON.stringify(message));
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
      }
    });
  }
  distroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDown);
    this.canvas.removeEventListener("mouseup", this.mouseUp);
    this.canvas.removeEventListener("mousemove", this.mouseMove);
  }
}
