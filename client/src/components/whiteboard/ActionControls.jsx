import React from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Trash2,
  Download,
} from 'lucide-react';

const ActionControls = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onClearCanvas,
  onExportPNG,
}) => {
  return (
    <>
      {/* Bottom Left: Undo / Redo & Zoom Controls */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2">
        {/* Undo / Redo group */}
        <div className="glass-panel p-1 rounded-2xl shadow-xl flex items-center border border-slate-200/90 dark:border-slate-700/90">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls group */}
        <div className="glass-panel p-1 rounded-2xl shadow-xl flex items-center border border-slate-200/90 dark:border-slate-700/90">
          <button
            onClick={onZoomOut}
            title="Zoom Out"
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={onResetZoom}
            title="Reset Zoom to 100%"
            className="px-2.5 py-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            title="Zoom In"
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Right: Clear & Export Actions */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          onClick={onClearCanvas}
          title="Clear Entire Canvas"
          className="glass-panel p-2.5 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-700/90 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all flex items-center gap-1.5 text-xs font-semibold"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear</span>
        </button>

        <button
          onClick={onExportPNG}
          title="Download Canvas as PNG image"
          className="glass-panel px-3.5 py-2.5 rounded-2xl shadow-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-2 text-xs font-bold hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>Export PNG</span>
        </button>
      </div>
    </>
  );
};

export default ActionControls;
