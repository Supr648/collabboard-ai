import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Copy, Check, Share2, Sparkles, ShieldCheck, Eye, Edit3 } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, roomId, title }) => {
  const [copied, setCopied] = useState(false);
  const [role, setRole] = useState('editor'); // 'editor' | 'viewer'

  const shareUrl = `${window.location.origin}/board/${roomId}${role === 'viewer' ? '?role=viewer' : ''}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share CollabBoard AI Workspace">
      <div className="space-y-5">
        <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Collaborators can draw, brainstorm with sticky notes, and synthesize diagrams simultaneously with live cursors.
          </p>
        </div>

        {/* Permission / Role Selection */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Link Permissions
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('editor')}
              className={`p-3 rounded-xl border text-left transition-all ${
                role === 'editor'
                  ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Edit3 className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold">Can Edit</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Full drawing, editing & AI generation rights
              </p>
            </button>

            <button
              type="button"
              onClick={() => setRole('viewer')}
              className={`p-3 rounded-xl border text-left transition-all ${
                role === 'viewer'
                  ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold">Can View</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Read-only observation without editing
              </p>
            </button>
          </div>
        </div>

        {/* Shareable Link */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Direct Invitation Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 text-xs font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Socket.IO room authenticated • Role-based access control</span>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
