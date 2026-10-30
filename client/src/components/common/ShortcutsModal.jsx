import React from 'react';
import Modal from './Modal';
import { Keyboard, Command, MousePointer, Sparkles, Navigation } from 'lucide-react';

const SHORTCUT_GROUPS = [
  {
    category: 'Drawing & Vector Tools',
    icon: MousePointer,
    shortcuts: [
      { key: 'V', desc: 'Select & Move tool' },
      { key: 'P', desc: 'Freehand Pen tool' },
      { key: 'H', desc: 'Highlighter tool' },
      { key: 'S', desc: 'Sticky Note tool' },
      { key: 'R', desc: 'Rectangle shape' },
      { key: 'C', desc: 'Circle shape' },
      { key: 'D', desc: 'Triangle shape' },
      { key: 'L', desc: 'Connector Line tool' },
      { key: 'A', desc: 'Magnetic Arrow tool' },
      { key: 'T', desc: 'Text tool' },
      { key: 'E', desc: 'Precision Eraser' },
    ],
  },
  {
    category: 'Editing & Canvas Actions',
    icon: Command,
    shortcuts: [
      { key: 'Ctrl + Z', desc: 'Undo last change' },
      { key: 'Ctrl + Y', desc: 'Redo change' },
      { key: 'Ctrl + D', desc: 'Duplicate selected elements' },
      { key: 'Ctrl + C', desc: 'Copy selected elements' },
      { key: 'Ctrl + V', desc: 'Paste copied elements' },
      { key: 'Del / Backspace', desc: 'Delete selected elements' },
      { key: 'Escape', desc: 'Deselect / Exit presentation' },
    ],
  },
  {
    category: 'Navigation & Power Tools',
    icon: Navigation,
    shortcuts: [
      { key: 'Ctrl + K', desc: 'Open Command Palette' },
      { key: '?', desc: 'Open this Shortcuts Guide' },
      { key: 'Space + Drag', desc: 'Pan infinite canvas' },
      { key: 'Pinch / Wheel', desc: 'Smooth zoom in / out' },
      { key: 'Right Click', desc: 'Open contextual menu' },
    ],
  },
];

const ShortcutsModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts & Accelerators" maxWidth="max-w-2xl">
      <div className="space-y-6">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Supercharge your collaborative workflow with CollabBoard AI keyboard shortcuts.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SHORTCUT_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <div
                key={group.category}
                className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 pb-1 border-b border-slate-200 dark:border-slate-800">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{group.category}</span>
                </div>
                <div className="space-y-1.5">
                  {group.shortcuts.map((s) => (
                    <div key={s.key} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">{s.desc}</span>
                      <kbd className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-mono text-[10px] font-bold shadow-xs">
                        {s.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShortcutsModal;
