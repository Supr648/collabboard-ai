import React, { useRef } from 'react';
import {
  MousePointer,
  Pencil,
  Highlighter,
  Eraser,
  StickyNote,
  Square,
  Circle,
  Triangle,
  Diamond,
  Hexagon,
  Minus,
  MoveRight,
  Type,
  Frame,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';

const TOOLS = [
  { id: 'select', label: 'Select & Move', icon: MousePointer, shortcut: 'V' },
  { id: 'pen', label: 'Freehand Pen', icon: Pencil, shortcut: 'P' },
  { id: 'highlighter', label: 'Highlighter', icon: Highlighter, shortcut: 'H' },
  { id: 'laser', label: 'Neon Laser Pointer', icon: Sparkles, shortcut: 'K' },
  { id: 'sticky', label: 'Sticky Note', icon: StickyNote, shortcut: 'S' },
  { id: 'rectangle', label: 'Rectangle', icon: Square, shortcut: 'R' },
  { id: 'circle', label: 'Circle / Oval', icon: Circle, shortcut: 'C' },
  { id: 'diamond', label: 'Diamond / Decision', icon: Diamond, shortcut: 'X' },
  { id: 'triangle', label: 'Triangle', icon: Triangle, shortcut: 'D' },
  { id: 'polygon', label: 'Polygon / Hexagon', icon: Hexagon, shortcut: 'G' },
  { id: 'line', label: 'Line', icon: Minus, shortcut: 'L' },
  { id: 'arrow', label: 'Connector Arrow', icon: MoveRight, shortcut: 'A' },
  { id: 'text', label: 'Rich Text', icon: Type, shortcut: 'T' },
  { id: 'frame', label: 'Presentation Frame', icon: Frame, shortcut: 'F' },
  { id: 'eraser', label: 'Precision Eraser', icon: Eraser, shortcut: 'E' },
];

const Toolbar = ({ activeTool, onSelectTool, onImportImage, isReadOnly = false }) => {
  const fileInputRef = useRef(null);

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onImportImage) {
      const reader = new FileReader();
      reader.onload = () => {
        onImportImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  if (isReadOnly) {
    return (
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 animate-in fade-in duration-200">
        <div className="glass-panel px-4 py-2 rounded-2xl shadow-xl border border-amber-500/50 bg-amber-50/80 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center gap-2">
          <span>👀 Read-Only Mode (Viewing Permissions)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="glass-panel p-1.5 rounded-2xl shadow-2xl flex items-center gap-1 border border-slate-200/90 dark:border-slate-700/90 overflow-x-auto max-w-[95vw]">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              title={`${tool.label} (${tool.shortcut})`}
              className={`relative p-2.5 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>
          );
        })}

        {/* Image Import button */}
        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Import Image (PNG, JPG, SVG)"
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
