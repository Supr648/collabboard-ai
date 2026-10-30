import React, { useRef, useEffect, useState, useCallback } from 'react';
import { renderElement, isPointNearElement } from '../../utils/canvasUtils';

const Canvas = ({
  elements,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  remoteLiveStroke,
  activeTool,
  strokeColor,
  strokeWidth,
  fillColor,
  zoom,
  setZoom,
  pan,
  setPan,
  onCursorMove,
  isDark = false,
}) => {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const currentElementRef = useRef(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Inline text input state
  const [textInput, setTextInput] = useState(null); // { x, y, canvasX, canvasY }
  const [textContent, setTextContent] = useState('');

  // Transform screen coordinates (clientX, clientY) to canvas coordinates taking zoom and pan into account
  const screenToCanvas = useCallback(
    (clientX, clientY) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left - pan.x) / zoom;
      const y = (clientY - rect.top - pan.y) / zoom;
      return { x, y };
    },
    [zoom, pan]
  );

  // Resize canvas to full window while respecting device pixel ratio
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    redrawCanvas();
  }, [elements, zoom, pan, remoteLiveStroke]);

  // Main canvas redraw loop
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply DPR scaling
    ctx.scale(dpr, dpr);

    // Apply Pan and Zoom transforms
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Render committed elements
    elements.forEach((el) => {
      renderElement(ctx, el);
    });

    // Render live element in progress by local user
    if (currentElementRef.current) {
      renderElement(ctx, currentElementRef.current);
    }

    // Render remote collaborator live stroke
    if (remoteLiveStroke) {
      renderElement(ctx, remoteLiveStroke);
    }

    ctx.restore();
  }, [elements, zoom, pan, remoteLiveStroke]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Handle Wheel: Zoom with Ctrl / Wheel, Pan with 2-finger scroll
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prev) => Math.min(3, Math.max(0.2, prev * zoomFactor)));
    } else {
      // Pan
      setPan((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  // Mouse Down
  const handleMouseDown = (e) => {
    // If text input is open and clicked outside, commit text
    if (textInput) {
      commitText();
      return;
    }

    // Middle click or spacebar held down activates panning
    if (e.button === 1 || e.spaceKey || activeTool === 'select') {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    if (e.button !== 0) return; // Only primary mouse button

    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    isDrawingRef.current = true;

    if (activeTool === 'eraser') {
      // Find element under cursor and delete
      eraseElementAt(x, y);
      return;
    }

    if (activeTool === 'text') {
      setTextInput({
        x: e.clientX,
        y: e.clientY,
        canvasX: x,
        canvasY: y,
      });
      setTextContent('');
      isDrawingRef.current = false;
      return;
    }

    const id = `el_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    if (activeTool === 'pen') {
      currentElementRef.current = {
        id,
        type: 'pen',
        points: [{ x, y }],
        strokeColor,
        strokeWidth,
      };
    } else if (['line', 'arrow', 'rectangle', 'circle'].includes(activeTool)) {
      currentElementRef.current = {
        id,
        type: activeTool,
        x1: x,
        y1: y,
        x2: x,
        y2: y,
        strokeColor,
        strokeWidth,
        fillColor: ['rectangle', 'circle'].includes(activeTool) ? fillColor : undefined,
      };
    }

    redrawCanvas();
  };

  // Mouse Move
  const handleMouseMove = (e) => {
    const { x, y } = screenToCanvas(e.clientX, e.clientY);

    // Broadcast cursor position to collaborators
    onCursorMove(x, y, activeTool);

    // Handle panning
    if (isPanningRef.current) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    if (!isDrawingRef.current) return;

    if (activeTool === 'eraser') {
      eraseElementAt(x, y);
      return;
    }

    const current = currentElementRef.current;
    if (!current) return;

    if (activeTool === 'pen') {
      // Append point if moved sufficiently
      const lastPoint = current.points[current.points.length - 1];
      const dist = Math.hypot(x - lastPoint.x, y - lastPoint.y);
      if (dist > 2) {
        current.points.push({ x, y });
        redrawCanvas();
      }
    } else if (['line', 'arrow', 'rectangle', 'circle'].includes(activeTool)) {
      current.x2 = x;
      current.y2 = y;
      redrawCanvas();
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }

    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const current = currentElementRef.current;
    if (current) {
      // Validate element before adding
      let isValid = true;
      if (current.type === 'pen' && current.points.length < 2) {
        isValid = false;
      } else if (
        ['line', 'arrow', 'rectangle', 'circle'].includes(current.type) &&
        Math.hypot(current.x2 - current.x1, current.y2 - current.y1) < 4
      ) {
        isValid = false;
      }

      if (isValid) {
        onAddElement(current);
      }
      currentElementRef.current = null;
      redrawCanvas();
    }
  };

  // Erase element near canvas coordinates
  const eraseElementAt = (cx, cy) => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (isPointNearElement(cx, cy, el, 12)) {
        onDeleteElement(el.id);
        break;
      }
    }
  };

  // Commit inline text element
  const commitText = () => {
    if (textInput && textContent.trim()) {
      const newEl = {
        id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        type: 'text',
        x: textInput.canvasX,
        y: textInput.canvasY,
        text: textContent,
        strokeColor,
        fontSize: Math.max(16, strokeWidth * 6),
      };
      onAddElement(newEl);
    }
    setTextInput(null);
    setTextContent('');
  };

  const getCursorStyle = () => {
    if (activeTool === 'select' || isPanningRef.current) return 'grab';
    if (activeTool === 'eraser') return 'crosshair';
    if (activeTool === 'text') return 'text';
    return 'crosshair';
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none ${
        isDark ? 'canvas-grid-dark' : 'canvas-grid-light'
      }`}
    >
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: getCursorStyle(),
        }}
        className="block touch-none"
      />

      {/* Floating text input for text tool */}
      {textInput && (
        <div
          className="absolute z-50 animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${textInput.x}px`,
            top: `${textInput.y}px`,
          }}
        >
          <textarea
            autoFocus
            rows={2}
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                commitText();
              } else if (e.key === 'Escape') {
                setTextInput(null);
                setTextContent('');
              }
            }}
            placeholder="Type note... (Enter to save)"
            className="p-2 rounded-xl glass-panel shadow-2xl border-2 border-indigo-500 font-sans text-sm focus:outline-none min-w-[180px] text-slate-900 dark:text-white bg-white/95 dark:bg-slate-900/95 resize-none"
          />
        </div>
      )}
    </div>
  );
};

export default Canvas;
