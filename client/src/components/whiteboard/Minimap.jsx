import React, { useRef, useEffect, useState } from 'react';
import { getElementBoundingBox } from '../../utils/canvasUtils';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';

const Minimap = ({ elements = [], zoom = 1, pan = { x: 0, y: 0 }, setPan, isDark = false }) => {
  const canvasRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (collapsed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Minimap background
    ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
    ctx.fillRect(0, 0, width, height);

    // Find bounding box of all elements
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    elements.forEach((el) => {
      const b = getElementBoundingBox(el);
      if (b) {
        minX = Math.min(minX, b.minX);
        minY = Math.min(minY, b.minY);
        maxX = Math.max(maxX, b.maxX);
        maxY = Math.max(maxY, b.maxY);
      }
    });

    if (minX === Infinity) {
      minX = 0;
      minY = 0;
      maxX = 1200;
      maxY = 800;
    }

    const padding = 100;
    const sceneW = Math.max(800, maxX - minX + padding * 2);
    const sceneH = Math.max(600, maxY - minY + padding * 2);
    const scale = Math.min(width / sceneW, height / sceneH);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-(minX + maxX) / 2, -(minY + maxY) / 2);

    // Draw miniature element blocks
    elements.forEach((el) => {
      const b = getElementBoundingBox(el);
      if (b) {
        ctx.fillStyle = el.strokeColor || '#6366f1';
        ctx.fillRect(b.minX, b.minY, b.width, b.height);
      }
    });

    // Draw current viewport window rectangle
    const viewW = window.innerWidth / zoom;
    const viewH = window.innerHeight / zoom;
    const viewX = -pan.x / zoom;
    const viewY = -pan.y / zoom;

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3 / scale;
    ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.strokeRect(viewX, viewY, viewW, viewH);
    ctx.fillRect(viewX, viewY, viewW, viewH);

    ctx.restore();
  }, [elements, zoom, pan, collapsed, isDark]);

  const handleMinimapClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Center viewport at clicked proportional point
    const propX = clickX / canvas.width;
    const propY = clickY / canvas.height;

    const targetX = -(propX * 2000 - window.innerWidth / 2);
    const targetY = -(propY * 1500 - window.innerHeight / 2);

    setPan({ x: targetX, y: targetY });
  };

  return (
    <div className="fixed bottom-20 right-6 z-40 animate-in fade-in duration-200 hidden md:block">
      <div className="glass-panel p-2 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-700/90 flex flex-col items-end">
        <div className="w-full flex items-center justify-between px-1 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <div className="flex items-center gap-1 text-indigo-500">
            <MapPin className="w-3 h-3" />
            <span>Minimap</span>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
          >
            {collapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {!collapsed && (
          <canvas
            ref={canvasRef}
            width={160}
            height={100}
            onClick={handleMinimapClick}
            className="rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer shadow-inner"
          />
        )}
      </div>
    </div>
  );
};

export default Minimap;
