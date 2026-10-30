import React from 'react';
import {
  MousePointer,
  Pencil,
  Eraser,
  Minus,
  MoveRight,
  Square,
  Circle,
  Type,
} from 'lucide-react';

const TOOLS = [
  { id: 'select', label: 'Select / Move', icon: MousePointer, shortcut: 'V' },
  { id: 'pen', label: 'Freehand Pen', icon: Pencil, shortcut: 'P' },
  { id: 'eraser', label: 'Eraser', icon: Eraser, shortcut: 'E' },
  { id: 'line', label: 'Line Tool', icon: Minus, shortcut: 'L' },
  { id: 'arrow', label: 'Arrow Tool', icon: MoveRight, shortcut: 'A' },
  { id: 'rectangle', label: 'Rectangle Tool', icon: Square, shortcut: 'R' },
  { id: 'circle', label: 'Circle Tool', icon: Circle, shortcut: 'C' },
  { id: 'text', label: 'Text Tool', icon: Type, shortcut: 'T' },
];

const Toolbar = ({ activeTool, onSelectTool }) => {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="glass-panel p-1.5 rounded-2xl shadow-2xl flex items-center gap-1 border border-slate-200/90 dark:border-slate-700/90">
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
      </div>
    </div>
  );
};

export default Toolbar;
