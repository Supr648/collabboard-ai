import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  renderElement,
  isPointNearElement,
  renderSelectionOutline,
  getHandleAtPoint,
  getElementBoundingBox,
} from '../../utils/canvasUtils';

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
  opacity = 1,
  textConfig = {},
  zoom,
  setZoom,
  pan,
  setPan,
  snapToGrid = false,
  selectedElements = [],
  setSelectedElements,
  onCursorMove,
  isDark = false,
  isReadOnly = false,
}) => {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const currentElementRef = useRef(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Move / Drag state for selected element
  const isDraggingSelectionRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const activeHandleRef = useRef(null); // 'nw' | 'ne' | 'se' | 'sw'
  const initialElementStateRef = useRef(null);

  // Marquee selection box
  const isMarqueeRef = useRef(false);
  const marqueeStartRef = useRef({ x: 0, y: 0 });
  const [marqueeBox, setMarqueeBox] = useState(null);

  // Image cache
  const imageCacheRef = useRef({});

  // Inline text input state
  const [textInput, setTextInput] = useState(null);
  const [textContent, setTextContent] = useState('');

  // Coordinate snapping helper
  const snap = useCallback(
    (val) => {
      if (!snapToGrid) return val;
      const gridSize = 20;
      return Math.round(val / gridSize) * gridSize;
    },
    [snapToGrid]
  );

  // Transform screen coordinates (clientX, clientY) to canvas coordinates
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
  }, [elements, zoom, pan, remoteLiveStroke, selectedElements]);

  // Main canvas redraw loop
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.scale(dpr, dpr);
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Render committed elements
    elements.forEach((el) => {
      renderElement(ctx, el, imageCacheRef.current);
    });

    // Render live element in progress by local user
    if (currentElementRef.current) {
      renderElement(ctx, currentElementRef.current, imageCacheRef.current);
    }

    // Render remote collaborator live stroke
    if (remoteLiveStroke) {
      renderElement(ctx, remoteLiveStroke, imageCacheRef.current);
    }

    // Render selection bounding box & resize handles
    if (selectedElements.length > 0) {
      renderSelectionOutline(ctx, selectedElements);
    }

    // Render marquee box if active
    if (marqueeBox) {
      ctx.save();
      ctx.strokeStyle = '#6366f1';
      ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.fillRect(marqueeBox.x, marqueeBox.y, marqueeBox.w, marqueeBox.h);
      ctx.strokeRect(marqueeBox.x, marqueeBox.y, marqueeBox.w, marqueeBox.h);
      ctx.restore();
    }

    ctx.restore();
  }, [elements, zoom, pan, remoteLiveStroke, selectedElements, marqueeBox]);

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
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prev) => Math.min(3, Math.max(0.2, prev * zoomFactor)));
    } else {
      setPan((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  // Mouse Down
  const handleMouseDown = (e) => {
    if (textInput) {
      commitText();
      return;
    }

    // Middle click or spacebar held down activates panning
    if (e.button === 1 || e.spaceKey) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    if (e.button !== 0) return;

    const { x, y } = screenToCanvas(e.clientX, e.clientY);

    // If Read-only, allow only panning
    if (isReadOnly) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    // Select Tool Handling
    if (activeTool === 'select') {
      // 1. Check if clicked a resize handle of currently selected element
      if (selectedElements.length === 1) {
        const handle = getHandleAtPoint(x, y, selectedElements[0]);
        if (handle) {
          activeHandleRef.current = handle;
          dragStartRef.current = { x, y };
          initialElementStateRef.current = JSON.parse(JSON.stringify(selectedElements[0]));
          return;
        }
      }

      // 2. Check if clicked on an existing element
      let hitElement = null;
      for (let i = elements.length - 1; i >= 0; i--) {
        if (isPointNearElement(x, y, elements[i], 8)) {
          hitElement = elements[i];
          break;
        }
      }

      if (hitElement) {
        if (e.shiftKey) {
          // Toggle selection
          const exists = selectedElements.some((el) => el.id === hitElement.id);
          if (exists) {
            setSelectedElements((prev) => prev.filter((el) => el.id !== hitElement.id));
          } else {
            setSelectedElements((prev) => [...prev, hitElement]);
          }
        } else {
          // Single selection
          setSelectedElements([hitElement]);
        }
        isDraggingSelectionRef.current = true;
        dragStartRef.current = { x, y };
        initialElementStateRef.current = JSON.parse(JSON.stringify(elements));
        return;
      }

      // 3. Clicked empty space -> start marquee selection box
      setSelectedElements([]);
      isMarqueeRef.current = true;
      marqueeStartRef.current = { x, y };
      setMarqueeBox({ x, y, w: 0, h: 0 });
      return;
    }

    // Eraser Tool
    if (activeTool === 'eraser') {
      isDrawingRef.current = true;
      eraseElementAt(x, y);
      return;
    }

    // Text Tool
    if (activeTool === 'text') {
      setTextInput({
        x: e.clientX,
        y: e.clientY,
        canvasX: snap(x),
        canvasY: snap(y),
      });
      setTextContent('');
      isDrawingRef.current = false;
      return;
    }

    // Drawing Tools
    isDrawingRef.current = true;
    const id = `el_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const snappedX = snap(x);
    const snappedY = snap(y);

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      currentElementRef.current = {
        id,
        type: activeTool,
        points: [{ x, y }],
        strokeColor,
        strokeWidth: activeTool === 'highlighter' ? 24 : strokeWidth,
        opacity: activeTool === 'highlighter' ? 0.35 : opacity,
      };
    } else if (activeTool === 'sticky') {
      currentElementRef.current = {
        id,
        type: 'sticky',
        x1: snappedX,
        y1: snappedY,
        x2: snappedX + 180,
        y2: snappedY + 140,
        strokeColor,
        fillColor: fillColor !== 'transparent' ? fillColor : '#fef3c7',
        text: 'Sticky Note\nDouble click to edit',
        opacity,
      };
    } else if (['line', 'arrow', 'rectangle', 'circle', 'triangle'].includes(activeTool)) {
      currentElementRef.current = {
        id,
        type: activeTool,
        x1: snappedX,
        y1: snappedY,
        x2: snappedX,
        y2: snappedY,
        strokeColor,
        strokeWidth,
        fillColor: ['rectangle', 'circle', 'triangle'].includes(activeTool) ? fillColor : undefined,
        opacity,
      };
    }

    redrawCanvas();
  };

  // Mouse Move
  const handleMouseMove = (e) => {
    const { x, y } = screenToCanvas(e.clientX, e.clientY);

    // Broadcast cursor position
    onCursorMove(x, y, activeTool);

    // Handle Panning
    if (isPanningRef.current) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    // Handle Resizing an Element
    if (activeHandleRef.current && selectedElements.length === 1) {
      const handle = activeHandleRef.current;
      const orig = initialElementStateRef.current;
      if (!orig) return;

      const updated = { ...orig };
      if (handle.includes('e')) updated.x2 = snap(x);
      if (handle.includes('w')) updated.x1 = snap(x);
      if (handle.includes('s')) updated.y2 = snap(y);
      if (handle.includes('n')) updated.y1 = snap(y);

      onUpdateElement(updated);
      setSelectedElements([updated]);
      return;
    }

    // Handle Dragging / Moving Selected Elements
    if (isDraggingSelectionRef.current && selectedElements.length > 0) {
      const dx = snap(x - dragStartRef.current.x);
      const dy = snap(y - dragStartRef.current.y);

      if (dx !== 0 || dy !== 0) {
        selectedElements.forEach((sel) => {
          const updated = { ...sel };
          if (updated.points) {
            updated.points = updated.points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
          } else if (updated.x1 !== undefined) {
            updated.x1 += dx;
            updated.y1 += dy;
            updated.x2 += dx;
            updated.y2 += dy;
          } else if (updated.x !== undefined) {
            updated.x += dx;
            updated.y += dy;
          }
          onUpdateElement(updated);
        });
        dragStartRef.current = { x, y };
      }
      return;
    }

    // Handle Marquee Selection
    if (isMarqueeRef.current) {
      const startX = marqueeStartRef.current.x;
      const startY = marqueeStartRef.current.y;
      const box = {
        x: Math.min(startX, x),
        y: Math.min(startY, y),
        w: Math.abs(x - startX),
        h: Math.abs(y - startY),
      };
      setMarqueeBox(box);

      // Find all elements within marquee box
      const hits = elements.filter((el) => {
        const b = getElementBoundingBox(el);
        if (!b) return false;
        return (
          b.minX >= box.x &&
          b.maxX <= box.x + box.w &&
          b.minY >= box.y &&
          b.maxY <= box.y + box.h
        );
      });
      setSelectedElements(hits);
      return;
    }

    if (!isDrawingRef.current) return;

    if (activeTool === 'eraser') {
      eraseElementAt(x, y);
      return;
    }

    const current = currentElementRef.current;
    if (!current) return;

    if (current.type === 'pen' || current.type === 'highlighter') {
      const lastPoint = current.points[current.points.length - 1];
      const dist = Math.hypot(x - lastPoint.x, y - lastPoint.y);
      if (dist > 2) {
        current.points.push({ x, y });
        redrawCanvas();
      }
    } else if (['line', 'arrow', 'rectangle', 'circle', 'triangle', 'sticky'].includes(current.type)) {
      current.x2 = snap(x);
      current.y2 = snap(y);
      redrawCanvas();
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }

    if (activeHandleRef.current) {
      activeHandleRef.current = null;
      initialElementStateRef.current = null;
      return;
    }

    if (isDraggingSelectionRef.current) {
      isDraggingSelectionRef.current = false;
      initialElementStateRef.current = null;
      return;
    }

    if (isMarqueeRef.current) {
      isMarqueeRef.current = false;
      setMarqueeBox(null);
      return;
    }

    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const current = currentElementRef.current;
    if (current) {
      let isValid = true;
      if ((current.type === 'pen' || current.type === 'highlighter') && current.points.length < 2) {
        isValid = false;
      } else if (
        ['line', 'arrow', 'rectangle', 'circle', 'triangle'].includes(current.type) &&
        Math.hypot(current.x2 - current.x1, current.y2 - current.y1) < 4
      ) {
        isValid = false;
      }

      if (isValid) {
        onAddElement(current);
        if (current.type === 'sticky') {
          setSelectedElements([current]);
        }
      }
      currentElementRef.current = null;
      redrawCanvas();
    }
  };

  // Erase element near coordinates
  const eraseElementAt = (cx, cy) => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (isPointNearElement(cx, cy, el, 12)) {
        onDeleteElement(el.id);
        break;
      }
    }
  };

  // Commit text
  const commitText = () => {
    if (textInput && textContent.trim()) {
      const newEl = {
        id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        type: 'text',
        x: textInput.canvasX,
        y: textInput.canvasY,
        text: textContent,
        strokeColor,
        fontSize: Math.max(16, strokeWidth * 5),
        fontFamily: textConfig.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        bold: !!textConfig.bold,
        italic: !!textConfig.italic,
        underline: !!textConfig.underline,
        align: textConfig.align || 'left',
        opacity,
      };
      onAddElement(newEl);
      setSelectedElements([newEl]);
    }
    setTextInput(null);
    setTextContent('');
  };

  const getCursorStyle = () => {
    if (isPanningRef.current) return 'grabbing';
    if (activeTool === 'select') {
      if (activeHandleRef.current) return 'nwse-resize';
      return isDraggingSelectionRef.current ? 'grabbing' : 'default';
    }
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
        style={{ cursor: getCursorStyle() }}
        className="block touch-none"
      />

      {/* Floating Rich Text Input */}
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
            placeholder="Type text note... (Enter to commit)"
            className="p-2.5 rounded-xl glass-panel shadow-2xl border-2 border-indigo-500 font-sans text-sm focus:outline-none min-w-[200px] text-slate-900 dark:text-white bg-white/95 dark:bg-slate-900/95 resize-none"
          />
        </div>
      )}
    </div>
  );
};

export default Canvas;
