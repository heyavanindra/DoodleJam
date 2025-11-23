import { v4 as uuidv4 } from "uuid";
import getExistingShapes from "../getExistingShapes";

type Tool =
  | "rectangle"
  | "circle"
  | "line"
  | "pencil"
  | "text"
  | "select"
  | "eraser"
  | "pan";

export type Shape =
  | {
      id: string;
      shape: {
        type: "rectangle";
        strokeColor: string;
        strokeWidth: number;
        backgroundColor?: string;
        fillPattern?: "solid" | "hachure" | "cross-hatch";
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }
  | {
      id: string;
      shape: {
        type: "circle";
        strokeColor: string;
        strokeWidth: number;
        backgroundColor?: string;
        fillPattern?: "solid" | "hachure" | "cross-hatch";
        centerX: number;
        centerY: number;
        radius: number;
      };
    }
  | {
      id: string;
      shape: {
        type: "line";
        strokeColor: string;
        strokeWidth: number;
        startX: number;
        startY: number;
        endX: number;
        endY: number;
      };
    }
  | {
      id: string;
      shape: {
        type: "pencil";
        strokeColor: string;
        strokeWidth: number;
        points: { x: number; y: number }[];
      };
    }
  | {
      id: string;
      shape: {
        type: "text";
        strokeColor: string;
        fontSize: "small" | "medium" | "large" | "xlarge";
        text: string;
        x: number;
        y: number;
        width: number;
        height: number;
      };
    };

type Operation =
  | { type: "add"; shapes: Shape[] }
  | { type: "delete"; shapes: Shape[] }
  | { type: "move"; originalShape: Shape; newShape: Shape; index: number }
  | {
      type: "propertyChange";
      originalShape: Shape;
      newShape: Shape;
      index: number;
    };

// Utility function: calculate distance from point to line segment
function pointToLineDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const A = px - x1,
    B = py - y1;
  const C = x2 - x1,
    D = y2 - y1;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  const param = lenSq !== 0 ? dot / lenSq : -1;

  let xx: number, yy: number;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  return Math.sqrt((px - xx) ** 2 + (py - yy) ** 2);
}

export class DRAW {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[] = [];
  private roomId: string;
  private socket: WebSocket | null;

  // Interaction state
  private isClicked = false;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "rectangle";
  private currentPath: { x: number; y: number }[] = [];

  // Style properties
  private strokeColor = "#ffffff";
  private strokeWidth = 2;
  private backgroundColor?: string;
  private fillPattern: "solid" | "hachure" | "cross-hatch" = "solid";

  // Pan & Zoom
  private scale = 1;
  private offsetX = 0;
  private offsetY = 0;
  private isPanning = false;
  private lastPanX = 0;
  private lastPanY = 0;

  // Selection & Movement
  private selectedShape: Shape | null = null;
  private selectedShapeIndex = -1;
  private isMovingShape = false;
  private moveStartX = 0;
  private moveStartY = 0;
  private originalShapeBeforeMove: Shape | null = null;

  // Undo/Redo
  private operationsStack: Operation[] = [];
  private redoStack: Operation[] = [];

  // Callbacks
  private onShapeSelect?: (shape: Shape | null) => void;
  private onToolChange?: (tool: Tool) => void;

  constructor(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket | null = null,
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;

    this.resizeCanvas();
    this.init();
    this.initEventHandlers();
    this.initSocketHandlers();

    window.addEventListener("resize", this.resizeCanvas);
  }

  private resizeCanvas = () => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.clearCanvas();
  };

  async init() {
    try {
      this.existingShapes = await getExistingShapes(this.roomId);
      this.clearCanvas();
    } catch (e) {
      console.error("Failed to load existing shapes:", e);
    }
  }

  // ===== GETTERS & SETTERS =====

  getTool(): Tool {
    return this.selectedTool;
  }

  setTool(tool: Tool) {
    if (this.selectedTool === "select" && tool !== "select") {
      this.clearSelection();
    }
    this.selectedTool = tool;
    this.updateCursor();
    this.onToolChange?.(tool);
  }

  getSelectedShape(): Shape | null {
    return this.selectedShape;
  }
  getScale(): number {
    return this.scale;
  }
  getOffset(): { x: number; y: number } {
    return { x: this.offsetX, y: this.offsetY };
  }

  setStrokeColor(color: string) {
    this.strokeColor = color;
  }
  setStrokeWidth(width: number) {
    this.strokeWidth = width;
  }
  setBackgroundColor(color?: string) {
    this.backgroundColor = color;
  }
  setFillPattern(pattern: "solid" | "hachure" | "cross-hatch") {
    this.fillPattern = pattern;
  }

  setOnShapeSelect(cb: (shape: Shape | null) => void) {
    this.onShapeSelect = cb;
  }
  setOnToolChange(cb: (tool: Tool) => void) {
    this.onToolChange = cb;
  }

  // ===== COORDINATE TRANSFORMS =====

  private screenToCanvas(
    clientX: number,
    clientY: number,
  ): { x: number; y: number } {
    return {
      x: (clientX - this.offsetX) / this.scale,
      y: (clientY - this.offsetY) / this.scale,
    };
  }

  // ===== CURSOR MANAGEMENT =====

  private updateCursor() {
    const cursors: Record<Tool, string> = {
      rectangle: "crosshair",
      circle: "crosshair",
      line: "crosshair",
      pencil: "crosshair",
      text: "text",
      select: "pointer",
      eraser: "url('/eraser.png') 8 8, auto",
      pan: "grab",
    };
    document.body.style.cursor = cursors[this.selectedTool] || "default";
  }

  // ===== ZOOM CONTROLS =====

  zoomIn() {
    this.scale = Math.min(this.scale * 1.1, 10);
    this.clearCanvas();
  }

  zoomOut() {
    this.scale = Math.max(this.scale * 0.9, 0.1);
    this.clearCanvas();
  }

  resetView() {
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.clearCanvas();
  }

  // ===== UNDO/REDO =====

  canUndo(): boolean {
    return this.operationsStack.length > 0;
  }
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  undo() {
    const op = this.operationsStack.pop();
    if (!op) return;

    if (op.type === "add") {
      op.shapes.forEach((shape) => {
        const idx = this.existingShapes.findIndex((s) => s.id === shape.id);
        if (idx >= 0) {
          this.existingShapes.splice(idx, 1);
          this.sendDeleteMessage(shape.id);
        }
      });
    } else if (op.type === "delete") {
      op.shapes.forEach((shape) => {
        this.existingShapes.push(shape);
        this.sendShapeMessage(shape);
      });
    } else if (op.type === "move" || op.type === "propertyChange") {
      if (op.index >= 0 && op.index < this.existingShapes.length) {
        this.existingShapes[op.index] = op.originalShape;
        this.sendDeleteMessage(op.newShape.id);
        this.sendShapeMessage(op.originalShape);
      }
    }

    this.redoStack.push(op);
    this.clearSelection();
    this.clearCanvas();
  }

  redo() {
    const op = this.redoStack.pop();
    if (!op) return;

    if (op.type === "add") {
      op.shapes.forEach((shape) => {
        this.existingShapes.push(shape);
        this.sendShapeMessage(shape);
      });
    } else if (op.type === "delete") {
      op.shapes.forEach((shape) => {
        const idx = this.existingShapes.findIndex((s) => s.id === shape.id);
        if (idx >= 0) {
          this.existingShapes.splice(idx, 1);
          this.sendDeleteMessage(shape.id);
        }
      });
    } else if (op.type === "move" || op.type === "propertyChange") {
      if (op.index >= 0 && op.index < this.existingShapes.length) {
        this.existingShapes[op.index] = op.newShape;
        this.sendDeleteMessage(op.originalShape.id);
        this.sendShapeMessage(op.newShape);
      }
    }

    this.operationsStack.push(op);
    this.clearSelection();
    this.clearCanvas();
  }

  private clearRedoStack() {
    this.redoStack = [];
  }

  // ===== SOCKET COMMUNICATION =====

  private sendShapeMessage(shape: Shape) {
    console.log(shape);
    this.socket?.send(
      JSON.stringify({
        type: "chat",
        roomId: this.roomId,
        message: JSON.stringify(shape),
      }),
    );
  }

  private sendDeleteMessage(id: string) {
    this.socket?.send(
      JSON.stringify({
        type: "delete_message",
        roomId: this.roomId,
        messageId: id,
      }),
    );
  }

  private initSocketHandlers() {
    if (!this.socket) return;
    this.socket.onmessage = (Event) => {
      console.log("here we go again");
      console.log(Event.data, "data");
      const message = JSON.parse(Event.data);
      if (message.type === "chat") {
        const shape = JSON.parse(message.message);
        this.existingShapes.push(shape);
      } else {
        console.log("ider log hua");
        this.existingShapes = this.existingShapes.filter(
          (s) => s.id !== message.messageId,
        );
      }
      this.clearCanvas();
    };
  }

  private handleSocketMessage = (event: MessageEvent) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "chat") {
      const shape = JSON.parse(msg.message);
      this.existingShapes.push(shape);
      this.clearCanvas();
    } else if (msg.type === "delete_message") {
      this.existingShapes = this.existingShapes.filter(
        (s) => s.id !== msg.messageId,
      );
      this.clearCanvas();
    }
  };

  // ===== SELECTION =====

  private clearSelection() {
    this.selectedShape = null;
    this.selectedShapeIndex = -1;
    this.isMovingShape = false;
    this.onShapeSelect?.(null);
    this.clearCanvas();
  }

  private findShapeAtPosition(
    x: number,
    y: number,
  ): { shape: Shape; index: number } | null {
    const tolerance = 5;

    for (let i = this.existingShapes.length - 1; i >= 0; i--) {
      const el = this.existingShapes[i];
      const s = el.shape;

      if (s.type === "rectangle") {
        const edges = [
          [s.x, s.y, s.x + s.width, s.y],
          [s.x + s.width, s.y, s.x + s.width, s.y + s.height],
          [s.x, s.y + s.height, s.x + s.width, s.y + s.height],
          [s.x, s.y, s.x, s.y + s.height],
        ];
        for (const [x1, y1, x2, y2] of edges) {
          if (pointToLineDistance(x, y, x1, y1, x2, y2) <= tolerance) {
            return { shape: el, index: i };
          }
        }
      } else if (s.type === "circle") {
        const dist = Math.sqrt((x - s.centerX) ** 2 + (y - s.centerY) ** 2);
        if (Math.abs(dist - s.radius) <= tolerance) {
          return { shape: el, index: i };
        }
      } else if (s.type === "line") {
        if (
          pointToLineDistance(x, y, s.startX, s.startY, s.endX, s.endY) <=
          tolerance
        ) {
          return { shape: el, index: i };
        }
      } else if (s.type === "pencil") {
        for (let j = 0; j < s.points.length - 1; j++) {
          const p1 = s.points[j],
            p2 = s.points[j + 1];
          if (pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y) <= tolerance) {
            return { shape: el, index: i };
          }
        }
      } else if (s.type === "text") {
        if (
          x >= s.x - 5 &&
          x <= s.x + s.width + 5 &&
          y >= s.y - s.height - 5 &&
          y <= s.y + 5
        ) {
          return { shape: el, index: i };
        }
      }
    }
    return null;
  }

  // ===== SHAPE PROPERTY UPDATES =====

  updateSelectedShapeStrokeColor(color: string) {
    if (!this.selectedShape) return;

    const original = JSON.parse(JSON.stringify(this.selectedShape));
    this.selectedShape.shape.strokeColor = color;
    this.existingShapes[this.selectedShapeIndex] = this.selectedShape;

    this.operationsStack.push({
      type: "propertyChange",
      originalShape: original,
      newShape: JSON.parse(JSON.stringify(this.selectedShape)),
      index: this.selectedShapeIndex,
    });
    this.clearRedoStack();

    this.sendDeleteMessage(this.selectedShape.id);
    this.sendShapeMessage(this.selectedShape);
    this.clearCanvas();
  }

  updateSelectedShapeBackgroundColor(color?: string) {
    if (!this.selectedShape) return;
    const s = this.selectedShape.shape;
    if (s.type !== "rectangle" && s.type !== "circle") return;

    const original = JSON.parse(JSON.stringify(this.selectedShape));
    s.backgroundColor = color;
    this.existingShapes[this.selectedShapeIndex] = this.selectedShape;

    this.operationsStack.push({
      type: "propertyChange",
      originalShape: original,
      newShape: JSON.parse(JSON.stringify(this.selectedShape)),
      index: this.selectedShapeIndex,
    });
    this.clearRedoStack();

    this.sendDeleteMessage(this.selectedShape.id);
    this.sendShapeMessage(this.selectedShape);
    this.clearCanvas();
  }

  updateSelectedShapeStrokeWidth(width: number) {
    if (!this.selectedShape || this.selectedShape.shape.type === "text") return;

    const original = JSON.parse(JSON.stringify(this.selectedShape));
    this.selectedShape.shape.strokeWidth = width;
    this.existingShapes[this.selectedShapeIndex] = this.selectedShape;

    this.operationsStack.push({
      type: "propertyChange",
      originalShape: original,
      newShape: JSON.parse(JSON.stringify(this.selectedShape)),
      index: this.selectedShapeIndex,
    });
    this.clearRedoStack();

    this.sendDeleteMessage(this.selectedShape.id);
    this.sendShapeMessage(this.selectedShape);
    this.clearCanvas();
  }

  // ===== TEXT TOOL =====

  addText(
    text: string,
    x: number,
    y: number,
    fontSize: "small" | "medium" | "large" | "xlarge" = "medium",
  ) {
    const fontSizes = { small: 14, medium: 20, large: 28, xlarge: 36 };
    const heights = { small: 20, medium: 30, large: 40, xlarge: 50 };
    const fontPx = fontSizes[fontSize];

    this.ctx.font = `${fontPx}px Arial`;

    const newShape: Shape = {
      id: uuidv4(),
      shape: {
        type: "text",
        strokeColor: this.strokeColor,
        fontSize,
        text,
        x,
        y: y + fontPx / 2,
        width: this.ctx.measureText(text).width + 20,
        height: heights[fontSize],
      },
    };

    this.existingShapes.push(newShape);
    this.operationsStack.push({ type: "add", shapes: [newShape] });
    this.clearRedoStack();
    this.sendShapeMessage(newShape);

    this.selectedShape = newShape;
    this.selectedShapeIndex = this.existingShapes.length - 1;
    this.onShapeSelect?.(newShape);
    this.clearCanvas();
  }

  // ===== EVENT HANDLERS =====

  private initEventHandlers() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("mouseup", this.handleMouseUp);
    this.canvas.addEventListener("wheel", this.handleWheel, { passive: false });
    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  private handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0 && e.button !== 1) return;

    const { x, y } = this.screenToCanvas(e.clientX, e.clientY);
    this.isClicked = true;
    this.startX = x;
    this.startY = y;

    // Middle mouse or pan tool = panning
    if (e.button === 1 || this.selectedTool === "pan") {
      this.isPanning = true;
      this.lastPanX = e.clientX;
      this.lastPanY = e.clientY;
      document.body.style.cursor = "grabbing";
      return;
    }

    if (this.selectedTool === "select") {
      const result = this.findShapeAtPosition(x, y);
      if (result) {
        this.selectedShape = result.shape;
        this.selectedShapeIndex = result.index;
        this.originalShapeBeforeMove = JSON.parse(JSON.stringify(result.shape));
        this.isMovingShape = true;
        this.moveStartX = x;
        this.moveStartY = y;
        document.body.style.cursor = "move";
        this.onShapeSelect?.(result.shape);
      } else {
        this.clearSelection();
      }
      this.clearCanvas();
      return;
    }

    if (this.selectedTool === "eraser") {
      this.eraseAtPosition(x, y);
      return;
    }

    if (this.selectedTool === "pencil") {
      this.currentPath = [{ x, y }];
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    // Handle panning
    if (this.isPanning) {
      this.offsetX += e.clientX - this.lastPanX;
      this.offsetY += e.clientY - this.lastPanY;
      this.lastPanX = e.clientX;
      this.lastPanY = e.clientY;
      this.clearCanvas();
      return;
    }

    if (!this.isClicked) return;

    const { x, y } = this.screenToCanvas(e.clientX, e.clientY);

    // Handle shape movement
    if (
      this.selectedTool === "select" &&
      this.isMovingShape &&
      this.selectedShape
    ) {
      const dx = x - this.startX;
      const dy = y - this.startY;
      this.moveShape(this.selectedShape, dx, dy);
      this.startX = x;
      this.startY = y;
      this.clearCanvas();
      return;
    }

    // Handle eraser
    if (this.selectedTool === "eraser") {
      this.eraseAtPosition(x, y);
      return;
    }

    // Handle drawing preview
    this.clearCanvas();
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.lineWidth = this.strokeWidth;

    const w = x - this.startX;
    const h = y - this.startY;

    if (this.selectedTool === "rectangle") {
      this.drawRectPreview(this.startX, this.startY, w, h);
    } else if (this.selectedTool === "circle") {
      this.drawCirclePreview(this.startX, this.startY, w, h);
    } else if (this.selectedTool === "line") {
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    } else if (this.selectedTool === "pencil") {
      this.currentPath.push({ x, y });
      this.drawPencilPath(this.currentPath);
    }
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (e.button !== 0 && e.button !== 1) return;

    this.isPanning = false;
    this.isClicked = false;

    if (e.button === 1) {
      this.updateCursor();
      return;
    }

    const { x, y } = this.screenToCanvas(e.clientX, e.clientY);

    // Finish moving shape
    if (
      this.selectedTool === "select" &&
      this.isMovingShape &&
      this.selectedShape &&
      this.originalShapeBeforeMove
    ) {
      this.isMovingShape = false;

      this.operationsStack.push({
        type: "move",
        originalShape: this.originalShapeBeforeMove,
        newShape: JSON.parse(JSON.stringify(this.selectedShape)),
        index: this.selectedShapeIndex,
      });
      this.clearRedoStack();

      this.sendDeleteMessage(this.selectedShape.id);
      this.sendShapeMessage(this.selectedShape);
      document.body.style.cursor = "pointer";
      return;
    }

    // Create new shape
    const w = x - this.startX;
    const h = y - this.startY;
    let newShape: Shape | null = null;

    if (this.selectedTool === "rectangle") {
      newShape = {
        id: uuidv4(),
        shape: {
          type: "rectangle",
          strokeColor: this.strokeColor,
          strokeWidth: this.strokeWidth,
          backgroundColor: this.backgroundColor,
          fillPattern: this.backgroundColor ? this.fillPattern : undefined,
          x: Math.min(this.startX, x),
          y: Math.min(this.startY, y),
          width: Math.abs(w),
          height: Math.abs(h),
        },
      };
    } else if (this.selectedTool === "circle") {
      const radius = Math.sqrt(w ** 2 + h ** 2) / 2;
      newShape = {
        id: uuidv4(),
        shape: {
          type: "circle",
          strokeColor: this.strokeColor,
          strokeWidth: this.strokeWidth,
          backgroundColor: this.backgroundColor,
          fillPattern: this.backgroundColor ? this.fillPattern : undefined,
          centerX: this.startX + w / 2,
          centerY: this.startY + h / 2,
          radius,
        },
      };
    } else if (this.selectedTool === "line") {
      newShape = {
        id: uuidv4(),
        shape: {
          type: "line",
          strokeColor: this.strokeColor,
          strokeWidth: this.strokeWidth,
          startX: this.startX,
          startY: this.startY,
          endX: x,
          endY: y,
        },
      };
    } else if (this.selectedTool === "pencil" && this.currentPath.length > 1) {
      newShape = {
        id: uuidv4(),
        shape: {
          type: "pencil",
          strokeColor: this.strokeColor,
          strokeWidth: this.strokeWidth,
          points: [...this.currentPath],
        },
      };
      this.currentPath = [];
    }

    if (newShape) {
      this.existingShapes.push(newShape);
      this.operationsStack.push({ type: "add", shapes: [newShape] });
      this.clearRedoStack();
      console.log("shape log ho gaya", newShape);
      this.sendShapeMessage(newShape);

      // Auto-select the new shape
      this.selectedShape = newShape;
      this.selectedShapeIndex = this.existingShapes.length - 1;
      this.selectedTool = "select";
      this.updateCursor();
      this.onShapeSelect?.(newShape);
      this.onToolChange?.("select");
    }

    this.clearCanvas();
  };

  private handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    this.scale = Math.min(Math.max(this.scale * delta, 0.1), 10);
    this.clearCanvas();
  };

  // ===== SHAPE MANIPULATION =====

  private moveShape(shape: Shape, dx: number, dy: number) {
    const s = shape.shape;
    if (s.type === "rectangle" || s.type === "text") {
      s.x += dx;
      s.y += dy;
    } else if (s.type === "circle") {
      s.centerX += dx;
      s.centerY += dy;
    } else if (s.type === "line") {
      s.startX += dx;
      s.startY += dy;
      s.endX += dx;
      s.endY += dy;
    } else if (s.type === "pencil") {
      s.points.forEach((p) => {
        p.x += dx;
        p.y += dy;
      });
    }
  }

  private eraseAtPosition(x: number, y: number) {
    const shapesToDelete: Shape[] = [];

    this.existingShapes = this.existingShapes.filter((el) => {
      const shouldDelete = this.isPointOnShape(x, y, el);
      if (shouldDelete) {
        shapesToDelete.push(el);
        this.sendDeleteMessage(el.id);
      }
      return !shouldDelete;
    });

    if (shapesToDelete.length > 0) {
      this.operationsStack.push({ type: "delete", shapes: shapesToDelete });
      this.clearRedoStack();
    }
    this.clearCanvas();
  }

  private isPointOnShape(x: number, y: number, el: Shape): boolean {
    const tolerance = 8;
    const s = el.shape;

    if (s.type === "rectangle") {
      const edges = [
        [s.x, s.y, s.x + s.width, s.y],
        [s.x + s.width, s.y, s.x + s.width, s.y + s.height],
        [s.x, s.y + s.height, s.x + s.width, s.y + s.height],
        [s.x, s.y, s.x, s.y + s.height],
      ];
      return edges.some(
        ([x1, y1, x2, y2]) =>
          pointToLineDistance(x, y, x1, y1, x2, y2) <= tolerance,
      );
    } else if (s.type === "circle") {
      const dist = Math.sqrt((x - s.centerX) ** 2 + (y - s.centerY) ** 2);
      return Math.abs(dist - s.radius) <= tolerance;
    } else if (s.type === "line") {
      return (
        pointToLineDistance(x, y, s.startX, s.startY, s.endX, s.endY) <=
        tolerance
      );
    } else if (s.type === "pencil") {
      for (let i = 0; i < s.points.length - 1; i++) {
        const p1 = s.points[i],
          p2 = s.points[i + 1];
        if (pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y) <= tolerance)
          return true;
      }
    } else if (s.type === "text") {
      return x >= s.x && x <= s.x + s.width && y >= s.y - s.height && y <= s.y;
    }
    return false;
  }

  // ===== DRAWING HELPERS =====

  private drawRectPreview(
    startX: number,
    startY: number,
    w: number,
    h: number,
  ) {
    const x = Math.min(startX, startX + w);
    const y = Math.min(startY, startY + h);
    const width = Math.abs(w);
    const height = Math.abs(h);

    if (this.backgroundColor) {
      this.ctx.fillStyle = this.backgroundColor;
      this.applyFillPattern(
        x,
        y,
        width,
        height,
        this.fillPattern,
        this.backgroundColor,
      );
    }
    this.ctx.strokeRect(x, y, width, height);
  }

  private drawCirclePreview(
    startX: number,
    startY: number,
    w: number,
    h: number,
  ) {
    const radius = Math.sqrt(w ** 2 + h ** 2) / 2;
    const centerX = startX + w / 2;
    const centerY = startY + h / 2;

    if (this.backgroundColor) {
      this.ctx.fillStyle = this.backgroundColor;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.applyCircleFillPattern(
        centerX,
        centerY,
        radius,
        this.fillPattern,
        this.backgroundColor,
      );
    }

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  private drawPencilPath(points: { x: number; y: number }[]) {
    if (points.length < 2) return;
    this.ctx.beginPath();
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.moveTo(points[0].x, points[0].y);
    for (const pt of points) {
      this.ctx.lineTo(pt.x, pt.y);
    }
    this.ctx.stroke();
  }

  // ===== FILL PATTERNS =====

  private applyFillPattern(
    x: number,
    y: number,
    width: number,
    height: number,
    pattern: "solid" | "hachure" | "cross-hatch",
    color: string,
  ) {
    if (pattern === "solid") {
      this.ctx.fillRect(x, y, width, height);
      return;
    }

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(x, y, width, height);
    this.ctx.clip();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;

    const spacing = 8;
    if (pattern === "hachure" || pattern === "cross-hatch") {
      for (let i = -height; i < width + height; i += spacing) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + i, y);
        this.ctx.lineTo(x + i + height, y + height);
        this.ctx.stroke();
      }
    }
    if (pattern === "cross-hatch") {
      for (let i = -height; i < width + height; i += spacing) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + i, y + height);
        this.ctx.lineTo(x + i + height, y);
        this.ctx.stroke();
      }
    }
    this.ctx.restore();
  }

  private applyCircleFillPattern(
    centerX: number,
    centerY: number,
    radius: number,
    pattern: "solid" | "hachure" | "cross-hatch",
    color: string,
  ) {
    if (pattern === "solid") {
      this.ctx.fill();
      return;
    }

    this.ctx.save();
    this.ctx.clip();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;

    const spacing = 8;
    const d = radius * 2;
    const x = centerX - radius;
    const y = centerY - radius;

    if (pattern === "hachure" || pattern === "cross-hatch") {
      for (let i = -d; i < d * 2; i += spacing) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + i, y);
        this.ctx.lineTo(x + i + d, y + d);
        this.ctx.stroke();
      }
    }
    if (pattern === "cross-hatch") {
      for (let i = -d; i < d * 2; i += spacing) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + i, y + d);
        this.ctx.lineTo(x + i + d, y);
        this.ctx.stroke();
      }
    }
    this.ctx.restore();
  }

  // ===== SELECTION OUTLINE =====

  private drawSelectionOutline() {
    if (!this.selectedShape) return;

    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeStyle = "#00AAFF";
    this.ctx.lineWidth = 2;

    const s = this.selectedShape.shape;

    if (s.type === "rectangle") {
      this.ctx.strokeRect(s.x - 5, s.y - 5, s.width + 10, s.height + 10);
    } else if (s.type === "circle") {
      this.ctx.beginPath();
      this.ctx.arc(s.centerX, s.centerY, s.radius + 5, 0, Math.PI * 2);
      this.ctx.stroke();
    } else if (s.type === "line") {
      this.ctx.beginPath();
      this.ctx.moveTo(s.startX, s.startY);
      this.ctx.lineTo(s.endX, s.endY);
      this.ctx.stroke();
      // Draw handles
      this.ctx.fillStyle = "#00AAFF";
      this.ctx.beginPath();
      this.ctx.arc(s.startX, s.startY, 5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(s.endX, s.endY, 5, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (s.type === "pencil") {
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const pt of s.points) {
        minX = Math.min(minX, pt.x);
        minY = Math.min(minY, pt.y);
        maxX = Math.max(maxX, pt.x);
        maxY = Math.max(maxY, pt.y);
      }
      this.ctx.strokeRect(
        minX - 5,
        minY - 5,
        maxX - minX + 10,
        maxY - minY + 10,
      );
    } else if (s.type === "text") {
      this.ctx.strokeRect(
        s.x - 5,
        s.y - s.height - 5,
        s.width + 10,
        s.height + 10,
      );
    }

    this.ctx.setLineDash([]);
    this.ctx.lineWidth = 1;
  }

  // ===== MAIN RENDER =====

  private clearCanvas() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply pan/zoom transforms
    this.ctx.setTransform(
      this.scale,
      0,
      0,
      this.scale,
      this.offsetX,
      this.offsetY,
    );

    // Draw all shapes
    console.log(this.existingShapes)
    for (const el of this.existingShapes) {
      const s = el.shape;
      this.ctx.strokeStyle = s.strokeColor || "#ffffff";
      this.ctx.lineWidth = s.type !== "text" ? s.strokeWidth || 1 : 1;

      if (s.type === "rectangle") {
        if (s.backgroundColor) {
          this.ctx.fillStyle = s.backgroundColor;
          if (s.fillPattern) {
            this.applyFillPattern(
              s.x,
              s.y,
              s.width,
              s.height,
              s.fillPattern,
              s.backgroundColor,
            );
          } else {
            this.ctx.fillRect(s.x, s.y, s.width, s.height);
          }
        }
        this.ctx.strokeRect(s.x, s.y, s.width, s.height);
      } else if (s.type === "circle") {
        if (s.backgroundColor) {
          this.ctx.fillStyle = s.backgroundColor;
          this.ctx.beginPath();
          this.ctx.arc(s.centerX, s.centerY, s.radius, 0, Math.PI * 2);
          if (s.fillPattern) {
            this.applyCircleFillPattern(
              s.centerX,
              s.centerY,
              s.radius,
              s.fillPattern,
              s.backgroundColor,
            );
          } else {
            this.ctx.fill();
          }
        }
        this.ctx.beginPath();
        this.ctx.arc(s.centerX, s.centerY, s.radius, 0, Math.PI * 2);
        this.ctx.stroke();
      } else if (s.type === "line") {
        this.ctx.beginPath();
        this.ctx.moveTo(s.startX, s.startY);
        this.ctx.lineTo(s.endX, s.endY);
        this.ctx.stroke();
      } else if (s.type === "pencil" && s.points.length > 0) {
        this.ctx.beginPath();
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.moveTo(s.points[0].x, s.points[0].y);
        for (const pt of s.points) {
          this.ctx.lineTo(pt.x, pt.y);
        }
        this.ctx.stroke();
      } else if (s.type === "text") {
        const fontSizes = { small: 14, medium: 20, large: 28, xlarge: 36 };
        this.ctx.fillStyle = s.strokeColor || "#ffffff";
        this.ctx.font = `${fontSizes[s.fontSize || "medium"]}px Arial`;
        this.ctx.fillText(s.text, s.x, s.y);
      }

      this.ctx.lineWidth = 1;
    }

    // Draw selection outline
    if (this.selectedShape) {
      this.drawSelectionOutline();
    }
  }

  // ===== EXPORT =====

  exportAsPNG(): string {
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    tempCtx.fillStyle = "black";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(this.canvas, 0, 0);
    return tempCanvas.toDataURL("image/png");
  }

  // ===== CLEANUP =====

  destroy() {
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
    this.canvas.removeEventListener("wheel", this.handleWheel);
    this.socket?.removeEventListener("message", this.handleSocketMessage);
    window.removeEventListener("resize", this.resizeCanvas);
  }
}
