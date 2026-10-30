import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  renderElement,
  isPointNearElement,
  renderSelectionOutline,
  getHandleAtPoint,
  getElementBoundingBox,
  findNearestAnchorPoint,
  renderLaserTrail,
} from '../../utils/canvasUtils';
import {
  Copy,
  Trash2,
  Lock,
  Unlock,
  CheckSquare,
  ArrowUpToLine,
  ArrowDownToLine,
  Layers,
  Sparkles,
} from 'lucide-react';

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
  onConvertToTask,
  onLaserMove,
  remoteLaserTrail = [],
  onBringToFront,
  onSendToBack,
  onToggleLock,
  onGroup,
  onUngroup,
  onDuplicateSelected,
}) => {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const currentElementRef = useRef(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Laser Pointer Trail
  const laserTrailRef = useRef([]);

  // Move / Drag state for selected element
  const isDraggingSelectionRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const activeHandleRef = useRef(null);
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

  // Right-click Context Menu
  const [contextMenu, setContextMenu] = useState(null);

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

    // Render Local & Remote Laser Pointer Trails
    if (laserTrailRef.current.length > 0) {
      renderLaserTrail(ctx, laserTrailRef.current);
    }
    if (remoteLaserTrail.length > 0) {
      renderLaserTrail(ctx, remoteLaserTrail);
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
  }, [elements, zoom, pan, remoteLiveStroke, selectedElements, marqueeBox, remoteLaserTrail]);

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

  // Right Click Context Menu Handler
  const handleContextMenu = (e) => {
    e.preventDefault();
    const { x, y } = screenToCanvas(e.clientX, e.clientY);

    let hitElement = null;
    for (let i = elements.length - 1; i >= 0; i--) {
      if (isPointNearElement(x, y, elements[i], 10)) {
        hitElement = elements[i];
        break;
      }
    }

    if (hitElement) {
      if (!selectedElements.some((el) => el.id === hitElement.id)) {
        setSelectedElements([hitElement]);
      }
      setContextMenu({ x: e.clientX, y: e.clientY, element: hitElement });
    } else {
      setContextMenu({ x: e.clientX, y: e.clientY, element: null });
    }
  };

  // Mouse Down
  const handleMouseDown = (e) => {
    if (contextMenu) {
      setContextMenu(null);
    }

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

    // Laser Pointer Tool
    if (activeTool === 'laser') {
      isDrawingRef.current = true;
      laserTrailRef.current = [{ x, y, time: Date.now() }];
      onLaserMove?.(x, y);
      redrawCanvas();
      return;
    }

    // Select Tool Handling
    if (activeTool === 'select') {
      // 1. Check if clicked a resize handle of currently selected element (only if not locked)
      if (selectedElements.length === 1 && !selectedElements[0].isLocked) {
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
        // If element is in a group, select the entire group
        let elementsToSelect = [hitElement];
        if (hitElement.groupId) {
          elementsToSelect = elements.filter((el) => el.groupId === hitElement.groupId);
        }

        if (e.shiftKey) {
          const exists = selectedElements.some((el) => el.id === hitElement.id);
          if (exists) {
            setSelectedElements((prev) => prev.filter((el) => el.id !== hitElement.id));
          } else {
            setSelectedElements((prev) => [...prev, ...elementsToSelect]);
          }
        } else {
          setSelectedElements(elementsToSelect);
        }

        if (!hitElement.isLocked) {
          isDraggingSelectionRef.current = true;
          dragStartRef.current = { x, y };
          initialElementStateRef.current = JSON.parse(JSON.stringify(elements));
        }
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
    } else if (activeTool === 'frame') {
      const frameCount = elements.filter((e) => e.type === 'frame').length + 1;
      currentElementRef.current = {
        id,
        type: 'frame',
        x1: snappedX,
        y1: snappedY,
        x2: snappedX,
        y2: snappedY,
        strokeColor: '#6366f1',
        title: `Frame ${frameCount}`,
        opacity: 1,
      };
    } else if (['line', 'arrow', 'rectangle', 'circle', 'triangle', 'diamond', 'polygon'].includes(activeTool)) {
      let startX = snappedX;
      let startY = snappedY;

      // Magnetic Snapping for line/arrow start
      if (activeTool === 'line' || activeTool === 'arrow') {
        const anchor = findNearestAnchorPoint(x, y, elements);
        if (anchor) {
          startX = anchor.x;
          startY = anchor.y;
        }
      }

      currentElementRef.current = {
        id,
        type: activeTool,
        x1: startX,
        y1: startY,
        x2: startX,
        y2: startY,
        strokeColor,
        strokeWidth,
        fillColor: ['rectangle', 'circle', 'triangle', 'diamond', 'polygon'].includes(activeTool) ? fillColor : undefined,
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

    // Laser pointer movement
    if (activeTool === 'laser' && isDrawingRef.current) {
      laserTrailRef.current.push({ x, y, time: Date.now() });
      onLaserMove?.(x, y);
      redrawCanvas();
      return;
    }

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
          if (sel.isLocked) return;
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

    // Handle Marquee Dragging
    if (isMarqueeRef.current) {
      const start = marqueeStartRef.current;
      const curX = Math.min(start.x, x);
      const curY = Math.min(start.y, y);
      const curW = Math.abs(x - start.x);
      const curH = Math.abs(y - start.y);

      setMarqueeBox({ x: curX, y: curY, w: curW, h: curH });

      const enclosed = elements.filter((el) => {
        const b = getElementBoundingBox(el);
        if (!b) return false;
        return b.minX >= curX && b.maxX <= curX + curW && b.minY >= curY && b.maxY <= curY + curH;
      });

      setSelectedElements(enclosed);
      return;
    }

    if (!isDrawingRef.current) return;

    // Eraser Tool Dragging
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
    } else if (['line', 'arrow'].includes(current.type)) {
      // Magnetic snapping for line/arrow end
      const anchor = findNearestAnchorPoint(x, y, elements, current.id);
      if (anchor) {
        current.x2 = anchor.x;
        current.y2 = anchor.y;
      } else {
        current.x2 = snap(x);
        current.y2 = snap(y);
      }
      redrawCanvas();
    } else if (['rectangle', 'circle', 'triangle', 'diamond', 'polygon', 'frame', 'sticky'].includes(current.type)) {
      current.x2 = snap(x);
      current.y2 = snap(y);
      redrawCanvas();
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    if (activeTool === 'laser') {
      isDrawingRef.current = false;
      setTimeout(() => {
        laserTrailRef.current = [];
        redrawCanvas();
      }, 1200);
      return;
    }

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
        ['line', 'arrow', 'rectangle', 'circle', 'triangle', 'diamond', 'polygon', 'frame'].includes(current.type) &&
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
    if (activeTool === 'laser') return 'crosshair';
    if (activeTool === 'select') {
      if (activeHandleRef.current) return 'nwse-resize';
      return isDraggingSelectionRef.current ? 'grabbing' : 'default';
    }
    if (activeTool === 'eraser') return 'crosshair';
    if (activeTool === 'text') return 'text';
    return 'crosshair';
  };

  // Get screen position for the Contextual Floating Action Toolbar
  const getContextualToolbarPos = () => {
    if (selectedElements.length === 0 || !canvasRef.current) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity;
    selectedElements.forEach((el) => {
      const box = getElementBoundingBox(el);
      if (box) {
        minX = Math.min(minX, box.minX);
        minY = Math.min(minY, box.minY);
        maxX = Math.max(maxX, box.maxX);
      }
    });
    if (minX === Infinity) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const midX = (minX + maxX) / 2;
    const screenX = midX * zoom + pan.x + rect.left;
    const screenY = minY * zoom + pan.y + rect.top - 46;
    return { x: screenX, y: Math.max(15, screenY) };
  };

  const toolbarPos = getContextualToolbarPos();

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
        onContextMenu={handleContextMenu}
        style={{ cursor: getCursorStyle() }}
        className="block touch-none"
      />

      {/* Floating Contextual Toolbar above selection */}
      {selectedElements.length > 0 && !isDraggingSelectionRef.current && !contextMenu && toolbarPos && (
        <div
          className="fixed z-40 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl glass-panel shadow-2xl border border-slate-200/90 dark:border-slate-700/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${toolbarPos.x}px`,
            top: `${toolbarPos.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick Color Swatches */}
          {['#6366f1', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'].map((c) => (
            <button
              key={c}
              onClick={() => {
                selectedElements.forEach((el) => {
                  onUpdateElement({
                    ...el,
                    strokeColor: c,
                    fillColor: el.fillColor && el.fillColor !== 'transparent' ? `${c}22` : el.fillColor,
                  });
                });
              }}
              style={{ backgroundColor: c }}
              className="w-4 h-4 rounded-full ring-1 ring-white/50 hover:scale-125 transition-transform"
            />
          ))}

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Quick Lock Toggle */}
          <button
            onClick={() => onToggleLock?.()}
            title={selectedElements.some((e) => e.isLocked) ? 'Unlock' : 'Lock'}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {selectedElements.some((e) => e.isLocked) ? (
              <Unlock className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Quick Convert to Task */}
          <button
            onClick={() => onConvertToTask?.(selectedElements[0])}
            title="Convert to Kanban Task"
            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>

          {/* Duplicate */}
          <button
            onClick={() => onDuplicateSelected?.()}
            title="Duplicate (Ctrl+D)"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={() => selectedElements.forEach((el) => onDeleteElement(el.id))}
            title="Delete (Del)"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Right-Click Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 min-w-[210px] text-xs font-medium text-slate-700 dark:text-slate-300 animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${Math.min(window.innerWidth - 230, contextMenu.x)}px`,
            top: `${Math.min(window.innerHeight - 320, contextMenu.y)}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.element && (
            <>
              <button
                onClick={() => {
                  onDuplicateSelected?.();
                  setContextMenu(null);
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
              >
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Duplicate Element</span>
                <span className="ml-auto text-[10px] text-slate-400">Ctrl+D</span>
              </button>

              <button
                onClick={() => {
                  onToggleLock?.();
                  setContextMenu(null);
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
              >
                {contextMenu.element?.isLocked ? (
                  <Unlock className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Lock className="w-4 h-4 text-rose-500" />
                )}
                <span>{contextMenu.element?.isLocked ? 'Unlock Element' : 'Lock Element'}</span>
              </button>

              <button
                onClick={() => {
                  if (onConvertToTask && contextMenu.element) {
                    onConvertToTask(contextMenu.element);
                  }
                  setContextMenu(null);
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-2.5 transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Convert to Kanban Task</span>
              </button>

              <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1" />

              <button
                onClick={() => {
                  onBringToFront?.();
                  setContextMenu(null);
                }}
                className="w-full px-3.5 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
              >
                <ArrowUpToLine className="w-4 h-4 text-slate-400" />
                <span>Bring to Front</span>
              </button>

              <button
                onClick={() => {
                  onSendToBack?.();
                  setContextMenu(null);
                }}
                className="w-full px-3.5 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
              >
                <ArrowDownToLine className="w-4 h-4 text-slate-400" />
                <span>Send to Back</span>
              </button>

              {selectedElements.length > 1 && (
                <button
                  onClick={() => {
                    onGroup?.();
                    setContextMenu(null);
                  }}
                  className="w-full px-3.5 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>Group Elements</span>
                </button>
              )}

              <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1" />

              <button
                onClick={() => {
                  selectedElements.forEach((el) => onDeleteElement(el.id));
                  setContextMenu(null);
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
                <span className="ml-auto text-[10px] text-rose-400">Del</span>
              </button>
            </>
          )}
        </div>
      )}

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
