import React from 'react';
import Modal from '../common/Modal';
import {
  Sparkles,
  Server,
  Kanban,
  GitFork,
  BrainCircuit,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

export const TEMPLATES = [
  {
    id: 'system_architecture',
    title: 'Cloud System Architecture',
    category: 'Engineering',
    icon: Server,
    color: '#6366f1',
    description: 'High-availability microservices diagram with API Gateway, Auth, Postgres, and Redis.',
    generateElements: () => [
      { id: 't_rect_1', type: 'rectangle', x1: 80, y1: 180, x2: 240, y2: 260, strokeColor: '#6366f1', strokeWidth: 3, fillColor: '#6366f122' },
      { id: 't_text_1', type: 'text', x: 100, y: 210, text: '🌐 Client (Web / Mobile)', strokeColor: '#0f172a', fontSize: 16 },
      { id: 't_arrow_1', type: 'arrow', x1: 240, y1: 220, x2: 360, y2: 220, strokeColor: '#6366f1', strokeWidth: 3 },

      { id: 't_rect_2', type: 'rectangle', x1: 360, y1: 160, x2: 540, y2: 280, strokeColor: '#8b5cf6', strokeWidth: 3, fillColor: '#8b5cf622' },
      { id: 't_text_2', type: 'text', x: 380, y: 200, text: '🛡️ API Gateway\n(Rate Limit & CORS)', strokeColor: '#0f172a', fontSize: 16 },
      { id: 't_arrow_2', type: 'arrow', x1: 540, y1: 190, x2: 660, y2: 140, strokeColor: '#8b5cf6', strokeWidth: 3 },
      { id: 't_arrow_3', type: 'arrow', x1: 540, y1: 250, x2: 660, y2: 300, strokeColor: '#8b5cf6', strokeWidth: 3 },

      { id: 't_rect_3', type: 'rectangle', x1: 660, y1: 90, x2: 840, y2: 190, strokeColor: '#10b981', strokeWidth: 3, fillColor: '#10b98122' },
      { id: 't_text_3', type: 'text', x: 680, y: 125, text: '⚡ Auth & Users Service\n(JWT + Bcrypt)', strokeColor: '#0f172a', fontSize: 15 },

      { id: 't_rect_4', type: 'rectangle', x1: 660, y1: 250, x2: 840, y2: 350, strokeColor: '#f59e0b', strokeWidth: 3, fillColor: '#f59e0b22' },
      { id: 't_text_4', type: 'text', x: 680, y: 285, text: '🎨 Whiteboard Service\n(Socket.IO Hub)', strokeColor: '#0f172a', fontSize: 15 },

      { id: 't_arrow_4', type: 'arrow', x1: 840, y1: 300, x2: 960, y2: 300, strokeColor: '#f59e0b', strokeWidth: 3 },
      { id: 't_circle_1', type: 'circle', x1: 960, y1: 240, x2: 1100, y2: 360, strokeColor: '#06b6d4', strokeWidth: 3, fillColor: '#06b6d422' },
      { id: 't_text_5', type: 'text', x: 990, y: 290, text: '💾 MongoDB\nAtlas Cluster', strokeColor: '#0f172a', fontSize: 15 },
    ],
  },
  {
    id: 'kanban_board',
    title: 'Agile Kanban Sprint Board',
    category: 'Productivity',
    icon: Kanban,
    color: '#10b981',
    description: '4-column agile task board with To-Do, In Progress, Review, and Done sticky notes.',
    generateElements: () => [
      // 4 Column Bounding Boxes
      { id: 'k_col_1', type: 'rectangle', x1: 60, y1: 100, x2: 320, y2: 560, strokeColor: '#94a3b8', strokeWidth: 2, fillColor: '#f1f5f988' },
      { id: 'k_txt_1', type: 'text', x: 120, y: 120, text: '📋 TO DO (3)', strokeColor: '#334155', fontSize: 18 },
      { id: 'k_sn_1', type: 'sticky', x1: 85, y1: 170, x2: 295, y2: 270, strokeColor: '#f59e0b', fillColor: '#fef3c7', text: 'Refactor Canvas Render Loop\nOptimized for 60 FPS' },
      { id: 'k_sn_2', type: 'sticky', x1: 85, y1: 290, x2: 295, y2: 390, strokeColor: '#f59e0b', fillColor: '#fef3c7', text: 'Integrate Gemini AI endpoint\nAdd diagram JSON parser' },

      { id: 'k_col_2', type: 'rectangle', x1: 340, y1: 100, x2: 600, y2: 560, strokeColor: '#6366f1', strokeWidth: 2, fillColor: '#e0e7ff44' },
      { id: 'k_txt_2', type: 'text', x: 380, y: 120, text: '⏳ IN PROGRESS (1)', strokeColor: '#4338ca', fontSize: 18 },
      { id: 'k_sn_3', type: 'sticky', x1: 365, y1: 170, x2: 575, y2: 270, strokeColor: '#6366f1', fillColor: '#e0e7ff', text: 'Socket.IO cursor smoothing\nReduce network packet lag' },

      { id: 'k_col_3', type: 'rectangle', x1: 620, y1: 100, x2: 880, y2: 560, strokeColor: '#8b5cf6', strokeWidth: 2, fillColor: '#ede9fe44' },
      { id: 'k_txt_3', type: 'text', x: 670, y: 120, text: '👀 CODE REVIEW (1)', strokeColor: '#6d28d9', fontSize: 18 },
      { id: 'k_sn_4', type: 'sticky', x1: 645, y1: 170, x2: 855, y2: 270, strokeColor: '#8b5cf6', fillColor: '#ede9fe', text: 'JWT Auth Middleware test\nBcrypt salt validation' },

      { id: 'k_col_4', type: 'rectangle', x1: 900, y1: 100, x2: 1160, y2: 560, strokeColor: '#10b981', strokeWidth: 2, fillColor: '#d1fae544' },
      { id: 'k_txt_4', type: 'text', x: 960, y: 120, text: '🎉 DONE (2)', strokeColor: '#047857', fontSize: 18 },
      { id: 'k_sn_5', type: 'sticky', x1: 925, y1: 170, x2: 1135, y2: 270, strokeColor: '#10b981', fillColor: '#d1fae5', text: 'Retina 2x PNG Export\nConfetti celebration trigger' },
    ],
  },
  {
    id: 'decision_flowchart',
    title: 'Decision Flowchart & Workflow',
    category: 'Engineering',
    icon: GitFork,
    color: '#8b5cf6',
    description: 'Standard flowchart with start/stop pills, decision diamonds, and branch connectors.',
    generateElements: () => [
      { id: 'f_start', type: 'circle', x1: 300, y1: 80, x2: 460, y2: 150, strokeColor: '#10b981', strokeWidth: 3, fillColor: '#d1fae588' },
      { id: 'f_txt_1', type: 'text', x: 335, y: 105, text: '🚀 User Login', strokeColor: '#065f46', fontSize: 16 },
      { id: 'f_arr_1', type: 'arrow', x1: 380, y1: 150, x2: 380, y2: 220, strokeColor: '#475569', strokeWidth: 3 },

      { id: 'f_dec', type: 'rectangle', x1: 290, y1: 220, x2: 470, y2: 310, strokeColor: '#f59e0b', strokeWidth: 3, fillColor: '#fef3c788' },
      { id: 'f_txt_2', type: 'text', x: 315, y: 250, text: 'Valid Credentials?', strokeColor: '#92400e', fontSize: 16 },

      { id: 'f_arr_yes', type: 'arrow', x1: 470, y1: 265, x2: 600, y2: 265, strokeColor: '#10b981', strokeWidth: 3 },
      { id: 'f_txt_yes', type: 'text', x: 505, y: 240, text: 'YES', strokeColor: '#10b981', fontSize: 14 },

      { id: 'f_proc_ok', type: 'rectangle', x1: 600, y1: 220, x2: 780, y2: 310, strokeColor: '#10b981', strokeWidth: 3, fillColor: '#d1fae588' },
      { id: 'f_txt_ok', type: 'text', x: 620, y: 250, text: 'Issue JWT Token\nLoad Dashboard', strokeColor: '#065f46', fontSize: 15 },

      { id: 'f_arr_no', type: 'arrow', x1: 380, y1: 310, x2: 380, y2: 400, strokeColor: '#ef4444', strokeWidth: 3 },
      { id: 'f_txt_no', type: 'text', x: 390, y: 340, text: 'NO', strokeColor: '#ef4444', fontSize: 14 },

      { id: 'f_proc_err', type: 'rectangle', x1: 290, y1: 400, x2: 470, y2: 480, strokeColor: '#ef4444', strokeWidth: 3, fillColor: '#fee2e288' },
      { id: 'f_txt_err', type: 'text', x: 315, y: 430, text: 'Return 401 & Alert', strokeColor: '#991b1b', fontSize: 15 },
    ],
  },
  {
    id: 'ai_brainstorming',
    title: 'Brainstorming & Mind Map',
    category: 'Design & Strategy',
    icon: BrainCircuit,
    color: '#ec4899',
    description: 'Central concept hub with branching idea nodes and opportunity clusters.',
    generateElements: () => [
      { id: 'b_center', type: 'circle', x1: 400, y1: 220, x2: 640, y2: 360, strokeColor: '#ec4899', strokeWidth: 4, fillColor: '#fce7f3' },
      { id: 'b_txt_c', type: 'text', x: 440, y: 275, text: '💡 CollabBoard AI\nGrowth Strategy', strokeColor: '#9d174d', fontSize: 18 },

      { id: 'b_arr_1', type: 'arrow', x1: 420, y1: 230, x2: 240, y2: 120, strokeColor: '#ec4899', strokeWidth: 2 },
      { id: 'b_sn_1', type: 'sticky', x1: 80, y1: 60, x2: 260, y2: 160, strokeColor: '#6366f1', fillColor: '#e0e7ff', text: 'AI Text-to-Diagram\nEnter prompt -> Auto Layout' },

      { id: 'b_arr_2', type: 'arrow', x1: 620, y1: 230, x2: 800, y2: 120, strokeColor: '#ec4899', strokeWidth: 2 },
      { id: 'b_sn_2', type: 'sticky', x1: 780, y1: 60, x2: 960, y2: 160, strokeColor: '#10b981', fillColor: '#d1fae5', text: 'Figma / SVG Import\nPaste vector paths' },

      { id: 'b_arr_3', type: 'arrow', x1: 420, y1: 350, x2: 240, y2: 440, strokeColor: '#ec4899', strokeWidth: 2 },
      { id: 'b_sn_3', type: 'sticky', x1: 80, y1: 420, x2: 260, y2: 520, strokeColor: '#f59e0b', fillColor: '#fef3c7', text: 'Live Audio & Video\nWebRTC voice rooms' },

      { id: 'b_arr_4', type: 'arrow', x1: 620, y1: 350, x2: 800, y2: 440, strokeColor: '#ec4899', strokeWidth: 2 },
      { id: 'b_sn_4', type: 'sticky', x1: 780, y1: 420, x2: 960, y2: 520, strokeColor: '#8b5cf6', fillColor: '#ede9fe', text: 'Jira / GitHub Sync\nConvert stickies to issues' },
    ],
  },
];

const TemplatesModal = ({ isOpen, onClose, onSelectTemplate }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose a Workspace Template" maxWidth="max-w-3xl">
      <div className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Jumpstart your team's workflow with professionally pre-structured canvas blueprints.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <div
                key={tpl.id}
                onClick={() => {
                  onSelectTemplate(tpl);
                  onClose();
                }}
                className="group p-4 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: tpl.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {tpl.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tpl.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Use Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default TemplatesModal;
