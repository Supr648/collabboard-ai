import React from 'react';
import Modal from '../common/Modal';
import {
  Sparkles,
  Pencil,
  Plus,
  Users2,
  Download,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

const DEFAULT_ACTIVITIES = [
  {
    id: 'act_1',
    type: 'create',
    icon: Plus,
    color: '#6366f1',
    title: 'Workspace Initialized',
    desc: 'New collaborative board created with real-time room ID',
    time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'act_2',
    type: 'ai',
    icon: Sparkles,
    color: '#ec4899',
    title: 'AI Diagram Synthesis',
    desc: 'Cloud Architecture diagram generated from natural language prompt',
    time: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'act_3',
    type: 'collab',
    icon: Users2,
    color: '#10b981',
    title: 'Collaborator Connected',
    desc: 'Simultaneous drawing session active with live cursor tracking',
    time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'act_4',
    type: 'export',
    icon: Download,
    color: '#f59e0b',
    title: 'High-Res PNG Exported',
    desc: 'Canvas exported at 2x retina resolution with watermark',
    time: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

const ActivityOverviewModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Workspace Activity & Audit Log" maxWidth="max-w-md">
      <div className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Chronological record of recent changes, collaborator joins, and AI generation events across your whiteboards.
        </p>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {DEFAULT_ACTIVITIES.map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="py-3 flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: act.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {act.title}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(act.time)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {act.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ActivityOverviewModal;
