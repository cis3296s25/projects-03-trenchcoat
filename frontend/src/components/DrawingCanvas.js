import { useRef, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

function DrawingCanvas(props) {
  const { appState } = props;
  const { socket } = appState;
  const gameCode = appState?.roomData?.code || null;
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(2);
  const [paths, setPaths] = useState([]); // Store local paths for undo
  const currentPath = useRef([]); // Temporary store for active drawing stroke

  useEffect(() => {
    if (!socket) return;

    const canvas = canvasRef.current;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const startDrawing = (e) => {
      isDrawing.current = true;
      const { x, y } = getPos(e);
      const strokeId = uuidv4();
      currentPath.current = [
        { x, y, color: brushColor, size: brushSize, id: strokeId },
      ];
      socket.emit("startDrawing", gameCode, { x, y });
    };

    const endDrawing = () => {
      if (isDrawing.current && currentPath.current.length > 0) {
        const stroke = [...currentPath.current];
        setPaths((prev) => [...prev, stroke]);
        socket.emit("strokeDone", gameCode, stroke);
      }
      isDrawing.current = false;
      socket.emit("endDrawing", gameCode);
    };

    const draw = (e) => {
      if (!isDrawing.current) return;
      const { x, y } = getPos(e);
      const point = { x, y, color: brushColor, size: brushSize };
      currentPath.current.push(point);
      socket.emit("drawing", gameCode, point);
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mouseup", endDrawing);
    canvas.addEventListener("mouseout", endDrawing);
    canvas.addEventListener("mousemove", draw);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mouseup", endDrawing);
      canvas.removeEventListener("mouseout", endDrawing);
      canvas.removeEventListener("mousemove", draw);
    };
  }, [socket, gameCode, brushColor, brushSize]);

  useEffect(() => {
    if (!socket) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    socket.on("startDrawing", ({ x, y }) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
    });

    socket.on("drawing", ({ x, y, color, size }) => {
      ctx.lineWidth = size || 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = color || "black";
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    socket.on("endDrawing", () => {
      ctx.beginPath();
    });

    socket.on("strokeDone", (stroke) => {
      setPaths((prev) => {
        const newPaths = [...prev, stroke];
        redrawAll(newPaths);
        return newPaths;
      });
    });

    socket.on("undoLastStroke", () => {
      setPaths((prev) => {
        const updatedPaths = prev.slice(0, -1);
        redrawAll(updatedPaths);
        return updatedPaths;
      });
    });

    socket.on("clearCanvas", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setPaths([]);
    });

    return () => {
      socket.off("startDrawing");
      socket.off("drawing");
      socket.off("endDrawing");
      socket.off("strokeDone");
      socket.off("undoLastStroke");
      socket.off("clearCanvas");
    };
  }, [socket]);

  const redrawAll = (strokePaths) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokePaths.forEach((path) => {
      ctx.beginPath();
      for (let i = 0; i < path.length; i++) {
        const { x, y, color, size } = path[i];
        ctx.lineWidth = size;
        ctx.lineCap = "round";
        ctx.strokeStyle = color;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    ctx.beginPath();
  };

  const handleUndo = () => {
    socket.emit("undoLastStroke", gameCode);
  };

  const handleClear = () => {
    socket.emit("clearCanvas", gameCode);
  };

  useEffect(() => {
    if (!socket) return;

    // Request canvas state when component mounts
    if (gameCode) {
      socket.emit("requestCanvasState", gameCode);
    }

    // Handle receiving canvas state
    socket.on("canvasState", (strokes) => {
      setPaths(strokes);
      redrawAll(strokes);
    });

    return () => {
      socket.off("canvasState");
    };
  }, [socket, gameCode]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1rem",
      }}
    >
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: "1rem" }}>
          Pen Color:
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
        <label>
          Pen Size:
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            style={{ marginLeft: "0.5rem" }}
          />
          <span style={{ marginLeft: "0.5rem" }}>{brushSize}px</span>
        </label>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={handleUndo} style={{ marginRight: "1rem" }}>
          Undo
        </button>
        <button onClick={handleClear}>Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        style={{ border: "2px solid black", background: "white" }}
      />
    </div>
  );
}

export default DrawingCanvas;
