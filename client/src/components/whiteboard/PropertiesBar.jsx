import React from 'react';
import { Palette, Pipette } from 'lucide-react';

const COLORS = [
  '#0f172a', // Slate 900
  '#475569', // Slate 600
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#ffffff', // White
];

const STROKE_WIDTHS = [
  { size: 2, label: 'Fine' },
  { size: 4, label: 'Medium' },
  { size: 8, label: 'Thick' },
  { size: 14, label: 'Heavy' },
];

const PropertiesBar = ({
  strokeColor,
  onChangeStrokeColor,
  strokeWidth,
  onChangeStrokeWidth,
  fillColor,
  onChangeFillColor,
  activeTool,
}) => {
  // Hide properties for eraser
  if (activeTool === 'eraser') return null;

  const showFill = ['rectangle', 'circle'].includes(activeTool);

  return (
    <div className="fixed top-36 left-6 z-40 animate-in fade-in slide-in-from-left-4 duration-200 hidden sm:block">
      <div className="glass-panel p-3 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-700/90 w-52 space-y-4">
        {/* Color Palette */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Stroke Color
          </span>
          <div className="grid grid-cols-5 gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onChangeStrokeColor(c)}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-transform hover:scale-110 ${
                  strokeColor === c
                    ? 'ring-2 ring-indigo-500 scale-105 border-transparent'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
                style={{ backgroundColor: c }}
              >
                {strokeColor === c && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      c === '#ffffff' ? 'bg-slate-900' : 'bg-white'
                    }`}
                  />
                )}
              </button>
            ))}
          </div>
          {/* Custom color picker */}
          <div className="mt-2 flex items-center gap-2">
            <label className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => onChangeStrokeColor(e.target.value)}
                className="w-4 h-4 rounded cursor-pointer border-0 p-0"
              />
              <span className="text-[11px] font-mono">{strokeColor}</span>
            </label>
          </div>
        </div>

        {/* Stroke Width Selector */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Stroke Width
          </span>
          <div className="grid grid-cols-4 gap-1">
            {STROKE_WIDTHS.map((w) => (
              <button
                key={w.size}
                onClick={() => onChangeStrokeWidth(w.size)}
                className={`py-1.5 rounded-lg flex flex-col items-center justify-center transition-all ${
                  strokeWidth === w.size
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div
                  className="rounded-full bg-current mb-1"
                  style={{ width: `${Math.min(16, w.size * 2)}px`, height: `${Math.min(16, w.size * 2)}px` }}
                />
                <span className="text-[10px]">{w.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fill mode if shape tool is active */}
        {showFill && (
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Shape Fill
            </span>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => onChangeFillColor('transparent')}
                className={`py-1 rounded-lg text-xs transition-all ${
                  fillColor === 'transparent'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                None
              </button>
              <button
                onClick={() => onChangeFillColor(`${strokeColor}22`)}
                className={`py-1 rounded-lg text-xs transition-all ${
                  fillColor !== 'transparent' && fillColor !== '#ffffff'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Tint
              </button>
              <button
                onClick={() => onChangeFillColor('#ffffff')}
                className={`py-1 rounded-lg text-xs transition-all ${
                  fillColor === '#ffffff'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Solid
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesBar;
