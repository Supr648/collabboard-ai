import React from 'react';
import {
  Palette,
  Pipette,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

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
  { size: 4, label: 'Med' },
  { size: 8, label: 'Bold' },
  { size: 14, label: 'Heavy' },
];

const STICKY_COLORS = [
  { stroke: '#f59e0b', fill: '#fef3c7', name: 'Yellow' },
  { stroke: '#10b981', fill: '#d1fae5', name: 'Green' },
  { stroke: '#3b82f6', fill: '#dbeafe', name: 'Blue' },
  { stroke: '#ec4899', fill: '#fce7f3', name: 'Pink' },
  { stroke: '#8b5cf6', fill: '#ede9fe', name: 'Purple' },
];

const PropertiesBar = ({
  strokeColor,
  onChangeStrokeColor,
  strokeWidth,
  onChangeStrokeWidth,
  fillColor,
  onChangeFillColor,
  opacity = 1,
  onChangeOpacity,
  activeTool,
  textConfig = {},
  onChangeTextConfig,
  selectedElement,
}) => {
  if (activeTool === 'eraser') return null;

  const effectiveTool = selectedElement?.type || activeTool;
  const isShape = ['rectangle', 'circle', 'triangle'].includes(effectiveTool);
  const isSticky = effectiveTool === 'sticky';
  const isText = effectiveTool === 'text';

  return (
    <div className="fixed top-36 left-6 z-40 animate-in fade-in slide-in-from-left-4 duration-200 hidden sm:block">
      <div className="glass-panel p-3 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-700/90 w-56 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
        {/* Sticky Note Color Presets */}
        {isSticky && (
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Note Theme
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {STICKY_COLORS.map((stk) => (
                <button
                  key={stk.name}
                  onClick={() => {
                    onChangeStrokeColor(stk.stroke);
                    onChangeFillColor(stk.fill);
                  }}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-transform hover:scale-110 ${
                    fillColor === stk.fill ? 'ring-2 ring-indigo-500 scale-105' : 'border-slate-300'
                  }`}
                  style={{ backgroundColor: stk.fill }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Color Palette (for non-sticky) */}
        {!isSticky && (
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Color
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
            {/* Custom hex picker */}
            <div className="mt-2">
              <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
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
        )}

        {/* Text Typography Options */}
        {isText && onChangeTextConfig && (
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Typography
            </span>
            {/* Bold, Italic, Underline */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onChangeTextConfig({ bold: !textConfig.bold })}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  textConfig.bold ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onChangeTextConfig({ italic: !textConfig.italic })}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  textConfig.italic ? 'bg-indigo-600 text-white italic' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onChangeTextConfig({ underline: !textConfig.underline })}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  textConfig.underline ? 'bg-indigo-600 text-white underline' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Underline"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />
              {/* Text Alignments */}
              <button
                onClick={() => onChangeTextConfig({ align: 'left' })}
                className={`p-1.5 rounded-lg text-xs ${
                  textConfig.align === 'left' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onChangeTextConfig({ align: 'center' })}
                className={`p-1.5 rounded-lg text-xs ${
                  textConfig.align === 'center' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onChangeTextConfig({ align: 'right' })}
                className={`p-1.5 rounded-lg text-xs ${
                  textConfig.align === 'right' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Stroke Width Selector */}
        {!isText && (
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
                    style={{ width: `${Math.min(14, w.size * 2)}px`, height: `${Math.min(14, w.size * 2)}px` }}
                  />
                  <span className="text-[10px]">{w.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Opacity Control */}
        {onChangeOpacity && (
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              <span>Opacity</span>
              <span className="font-mono text-slate-600 dark:text-slate-300">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {/* Shape Fill Modes */}
        {isShape && (
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Fill Style
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
