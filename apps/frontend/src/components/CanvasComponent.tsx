"use client";

import { DRAW } from "@/lib/canvas/draw";
import { cn } from "@/lib/utils";
import {
  Circle,
  Eraser,
  Hand,
  Minus,
  MousePointer2,
  Pencil,
  Plus,
  Redo2,
  RotateCcw,
  Slash,
  Square,
  Type,
  Undo2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Tool =
  | "rectangle"
  | "circle"
  | "line"
  | "pencil"
  | "text"
  | "select"
  | "eraser"
  | "pan";

interface ToolButtonProps {
  tool: Tool;
  currentTool: Tool;
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
}

const ToolButton = ({
  tool,
  currentTool,
  onClick,
  icon,
  tooltip,
}: ToolButtonProps) => (
  <button
    className={cn(
      "p-2 rounded-lg transition-colors hover:bg-neutral-500",
      currentTool === tool && "bg-orange-600 text-white",
    )}
    onClick={onClick}
    title={tooltip}
  >
    {icon}
  </button>
);

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
  allowNone?: boolean;
  onClear?: () => void;
}

const ColorPicker = ({
  label,
  color,
  onChange,
  allowNone,
  onClear,
}: ColorPickerProps) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-neutral-300">{label}</span>
    <input
      type="color"
      value={color}
      onChange={(e) => onChange(e.target.value)}
      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
    />
    {allowNone && onClear && (
      <button
        onClick={onClear}
        className="text-xs px-2 py-1 bg-neutral-700 rounded hover:bg-neutral-600"
      >
        None
      </button>
    )}
  </div>
);

const CanvasComponent = ({ roomId, ws }: { roomId: string; ws: WebSocket }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawRef = useRef<DRAW | null>(null);

  const [currentTool, setCurrentTool] = useState<Tool>("rectangle");
  const [strokeColor, setStrokeColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState<string | undefined>();
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [selectedShape, setSelectedShape] = useState<any>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [scale, setScale] = useState(1);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const draw = new DRAW(canvasRef.current, roomId, ws);
    drawRef.current = draw;

    // Set up callbacks
    draw.setOnShapeSelect((shape) => {
      setSelectedShape(shape);
      updateUndoRedoState();
    });

    draw.setOnToolChange((tool) => {
      setCurrentTool(tool);
    });

    return () => {
      draw.destroy();
      drawRef.current = null;
    };
  }, [roomId, ws]);

  const updateUndoRedoState = useCallback(() => {
    if (drawRef.current) {
      setCanUndo(drawRef.current.canUndo());
      setCanRedo(drawRef.current.canRedo());
    }
  }, []);

  // Sync tool changes
  const handleToolChange = useCallback((tool: Tool) => {
    setCurrentTool(tool);
    drawRef.current?.setTool(tool);
  }, []);

  // Sync style changes
  useEffect(() => {
    drawRef.current?.setStrokeColor(strokeColor);
  }, [strokeColor]);

  useEffect(() => {
    drawRef.current?.setBackgroundColor(backgroundColor);
  }, [backgroundColor]);

  useEffect(() => {
    drawRef.current?.setStrokeWidth(strokeWidth);
  }, [strokeWidth]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const draw = drawRef.current;
      if (!draw) return;

      // Tool shortcuts
      if (e.key === "v" || e.key === "V") handleToolChange("select");
      if (e.key === "r" || e.key === "R") handleToolChange("rectangle");
      if (e.key === "c" || e.key === "C") handleToolChange("circle");
      if (e.key === "l" || e.key === "L") handleToolChange("line");
      if (e.key === "p" || e.key === "P") handleToolChange("pencil");
      if (e.key === "t" || e.key === "T") handleToolChange("text");
      if (e.key === "e" || e.key === "E") handleToolChange("eraser");
      if (e.key === "h" || e.key === "H") handleToolChange("pan");

      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        draw.undo();
        updateUndoRedoState();
      }
      if (
        (e.metaKey || e.ctrlKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        draw.redo();
        updateUndoRedoState();
      }

      // Zoom
      if ((e.metaKey || e.ctrlKey) && e.key === "=") {
        e.preventDefault();
        draw.zoomIn();
        setScale(draw.getScale());
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "-") {
        e.preventDefault();
        draw.zoomOut();
        setScale(draw.getScale());
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "0") {
        e.preventDefault();
        draw.resetView();
        setScale(1);
      }

      // Delete selected shape
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedShape && draw.getSelectedShape()) {
          // Could add deleteSelectedShape method to DRAW class
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleToolChange, selectedShape, updateUndoRedoState]);

  // Handle text tool click
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (currentTool !== "text") return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect || !drawRef.current) return;

      const x =
        (e.clientX - rect.left - drawRef.current.getOffset().x) /
        drawRef.current.getScale();
      const y =
        (e.clientY - rect.top - drawRef.current.getOffset().y) /
        drawRef.current.getScale();

      const text = prompt("Enter text:");
      if (text) {
        drawRef.current.addText(text, x, y, "medium");
        updateUndoRedoState();
      }
    },
    [currentTool, updateUndoRedoState],
  );

  // Update selected shape properties
  const handleSelectedStrokeColor = (color: string) => {
    setStrokeColor(color);
    drawRef.current?.updateSelectedShapeStrokeColor(color);
    updateUndoRedoState();
  };

  const handleSelectedBackgroundColor = (color: string) => {
    setBackgroundColor(color);
    drawRef.current?.updateSelectedShapeBackgroundColor(color);
    updateUndoRedoState();
  };

  const handleSelectedStrokeWidth = (width: number) => {
    setStrokeWidth(width);
    drawRef.current?.updateSelectedShapeStrokeWidth(width);
    updateUndoRedoState();
  };

  const tools: { tool: Tool; icon: React.ReactNode; tooltip: string }[] = [
    {
      tool: "select",
      icon: <MousePointer2 size={20} />,
      tooltip: "Select (V)",
    },
    { tool: "rectangle", icon: <Square size={20} />, tooltip: "Rectangle (R)" },
    { tool: "circle", icon: <Circle size={20} />, tooltip: "Circle (C)" },
    { tool: "line", icon: <Slash size={20} />, tooltip: "Line (L)" },
    { tool: "pencil", icon: <Pencil size={20} />, tooltip: "Pencil (P)" },
    { tool: "text", icon: <Type size={20} />, tooltip: "Text (T)" },
    { tool: "eraser", icon: <Eraser size={20} />, tooltip: "Eraser (E)" },
    { tool: "pan", icon: <Hand size={20} />, tooltip: "Pan (H)" },
  ];

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Main Toolbar */}
      <div className="absolute flex top-3 left-1/2 -translate-x-1/2 p-2 bg-neutral-800 rounded-xl gap-1 text-neutral-200 shadow-lg z-10">
        {tools.map(({ tool, icon, tooltip }) => (
          <ToolButton
            key={tool}
            tool={tool}
            currentTool={currentTool}
            onClick={() => handleToolChange(tool)}
            icon={icon}
            tooltip={tooltip}
          />
        ))}

        <div className="w-px bg-neutral-600 mx-2" />

        {/* Undo/Redo */}
        <button
          className={cn(
            "p-2 rounded-lg transition-colors",
            canUndo ? "hover:bg-neutral-500" : "opacity-40",
          )}
          onClick={() => {
            drawRef.current?.undo();
            updateUndoRedoState();
          }}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={20} />
        </button>
        <button
          className={cn(
            "p-2 rounded-lg transition-colors",
            canRedo ? "hover:bg-neutral-500" : "opacity-40",
          )}
          onClick={() => {
            drawRef.current?.redo();
            updateUndoRedoState();
          }}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={20} />
        </button>
      </div>

      {/* Style Panel */}
      <div className="absolute top-3 left-3 p-4 bg-neutral-800 rounded-xl text-neutral-200 shadow-lg z-10 space-y-4 min-w-[200px]">
        <ColorPicker
          label="Stroke"
          color={strokeColor}
          onChange={selectedShape ? handleSelectedStrokeColor : setStrokeColor}
        />

        <ColorPicker
          label="Fill"
          color={backgroundColor || "#000000"}
          onChange={
            selectedShape ? handleSelectedBackgroundColor : setBackgroundColor
          }
          allowNone
          onClear={() => {
            setBackgroundColor(undefined);
            if (selectedShape)
              drawRef.current?.updateSelectedShapeBackgroundColor(undefined);
          }}
        />

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-300">Width</span>
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => {
              const w = Number(e.target.value);
              selectedShape ? handleSelectedStrokeWidth(w) : setStrokeWidth(w);
            }}
            className="flex-1"
          />
          <span className="text-xs w-6">{strokeWidth}</span>
        </div>

        {selectedShape && (
          <div className="pt-2 border-t border-neutral-700">
            <p className="text-xs text-neutral-400">
              Selected: {selectedShape.shape.type}
            </p>
          </div>
        )}
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 p-2 bg-neutral-800 rounded-xl text-neutral-200 shadow-lg z-10">
        <button
          className="p-2 rounded-lg hover:bg-neutral-500 transition-colors"
          onClick={() => {
            drawRef.current?.zoomOut();
            setScale(drawRef.current?.getScale() || 1);
          }}
          title="Zoom Out"
        >
          <Minus size={18} />
        </button>
        <span className="text-sm w-16 text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          className="p-2 rounded-lg hover:bg-neutral-500 transition-colors"
          onClick={() => {
            drawRef.current?.zoomIn();
            setScale(drawRef.current?.getScale() || 1);
          }}
          title="Zoom In"
        >
          <Plus size={18} />
        </button>
        <button
          className="p-2 rounded-lg hover:bg-neutral-500 transition-colors"
          onClick={() => {
            drawRef.current?.resetView();
            setScale(1);
          }}
          title="Reset View"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      <canvas ref={canvasRef} onClick={handleCanvasClick} className="block" />
    </section>
  );
};

export default CanvasComponent;
