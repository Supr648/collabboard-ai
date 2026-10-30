import React, { useState, useRef, useEffect } from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Tv,
  Trash2,
  Download,
  ChevronUp,
  FileImage,
  Code,
  FileText,
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
  onFitToScreen,
  snapToGrid,
  onToggleSnapToGrid,
  onTogglePresentation,
  onClearCanvas,
  onExportPNG,
  onExportSVG,
  onExportPDF,
}) => {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Bottom Left Controls: Undo, Redo, Zoom, Grid, Fit */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2 flex-wrap">
        {/* Undo / Redo */}
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

        {/* Zoom Controls */}
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
            className="px-2 py-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
          <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />
          {/* Fit to Screen */}
          <button
            onClick={onFitToScreen}
            title="Fit to Content"
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Snap to Grid */}
        <button
          onClick={onToggleSnapToGrid}
          title={snapToGrid ? 'Snap to Grid: ON' : 'Snap to Grid: OFF'}
          className={`glass-panel p-2.5 rounded-2xl shadow-xl border transition-all ${
            snapToGrid
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-slate-200/90 dark:border-slate-700/90 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Presentation Mode */}
        <button
          onClick={onTogglePresentation}
          title="Presentation Mode"
          className="glass-panel p-2.5 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-700/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 text-xs font-semibold"
        >
          <Tv className="w-4 h-4 text-purple-500" />
          <span className="hidden sm:inline">Present</span>
        </button>
      </div>

      {/* Bottom Right Controls: Clear & Multi-Format Export */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          onClick={onClearCanvas}
          title="Clear Entire Canvas"
          className="glass-panel p-2.5 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-700/90 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all flex items-center gap-1.5 text-xs font-semibold"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear</span>
        </button>

        {/* Export Dropdown Group */}
        <div className="relative" ref={exportRef}>
          <div className="flex items-center rounded-2xl shadow-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-600 text-white overflow-hidden">
            <button
              onClick={onExportPNG}
              title="Download Canvas as PNG"
              className="px-3.5 py-2.5 hover:bg-indigo-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <Download className="w-4 h-4" />
              <span>Export PNG</span>
            </button>
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="px-2 py-2.5 border-l border-indigo-500 hover:bg-indigo-700 transition-colors"
              title="More export formats"
            >
              <ChevronUp className={`w-3.5 h-3.5 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {exportMenuOpen && (
            <div className="absolute right-0 bottom-12 w-44 rounded-2xl glass-panel shadow-2xl p-1.5 border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 z-50">
              <button
                onClick={() => {
                  setExportMenuOpen(false);
                  onExportPNG();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FileImage className="w-4 h-4 text-indigo-500" />
                <span>PNG Image (2x)</span>
              </button>
              <button
                onClick={() => {
                  setExportMenuOpen(false);
                  onExportSVG();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Code className="w-4 h-4 text-emerald-500" />
                <span>Vector SVG</span>
              </button>
              <button
                onClick={() => {
                  setExportMenuOpen(false);
                  onExportPDF();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FileText className="w-4 h-4 text-rose-500" />
                <span>PDF Document</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ActionControls;
