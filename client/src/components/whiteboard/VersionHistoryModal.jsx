import React from 'react';
import Modal from '../common/Modal';
import { History, RotateCcw, Clock, Layers, CheckCircle2 } from 'lucide-react';
import { formatRelativeTime, formatDate } from '../../utils/formatters';

const VersionHistoryModal = ({ isOpen, onClose, versions = [], onRestoreVersion }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Board Version History & Snapshots" maxWidth="max-w-lg">
      <div className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Restore previous auto-saved checkpoints and snapshots if you need to rollback canvas changes.
        </p>

        {versions.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
            {versions.map((ver, idx) => (
              <div key={ver.id || idx} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                    v{versions.length - idx}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {ver.title || `Snapshot ${versions.length - idx}`}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatRelativeTime(ver.timestamp || ver.createdAt)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-2.5 h-2.5" />
                        {ver.elements?.length || 0} elements
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onRestoreVersion(ver.elements || []);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 transition-all hover:scale-105"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No previous checkpoints recorded yet. Changes auto-save periodically as you draw.
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VersionHistoryModal;
