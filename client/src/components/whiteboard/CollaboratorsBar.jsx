import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Users,
  RefreshCw,
  Edit2,
  Check,
  Sparkles,
  Layout,
  History,
  Shield,
  Eye,
} from 'lucide-react';
import { getInitials } from '../../utils/formatters';

const CollaboratorsBar = ({
  title,
  onRenameTitle,
  participants = [],
  saveStatus = 'saved',
  onOpenShare,
  onOpenAi,
  onOpenTemplates,
  onOpenHistory,
  isOwner = true,
  userRole = 'owner', // 'owner' | 'editor' | 'viewer'
  isPresentation = false,
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  const handleTitleSubmit = (e) => {
    e.preventDefault();
    if (tempTitle.trim()) {
      onRenameTitle(tempTitle.trim());
    }
    setEditingTitle(false);
  };

  // Hide top bar in presentation mode
  if (isPresentation) return null;

  return (
    <div className="fixed top-3 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
      {/* Left side: Back, Title, Save Status, History */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <Link
          to="/dashboard"
          className="glass-panel p-2.5 rounded-2xl shadow-lg border border-slate-200/90 dark:border-slate-700/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        {editingTitle && isOwner ? (
          <form onSubmit={handleTitleSubmit} className="flex items-center gap-1">
            <input
              type="text"
              value={tempTitle}
              autoFocus
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              className="glass-panel px-3 py-1.5 rounded-xl border border-indigo-500 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
            />
            <button
              type="submit"
              className="glass-panel p-1.5 rounded-xl bg-indigo-600 text-white shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div
            onClick={() => {
              if (isOwner) {
                setTempTitle(title);
                setEditingTitle(true);
              }
            }}
            className="glass-panel px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200/90 dark:border-slate-700/90 flex items-center gap-2 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 transition-all max-w-[200px] sm:max-w-xs"
            title={isOwner ? 'Click to rename' : title}
          >
            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
              {title || 'Untitled Whiteboard'}
            </span>
            {isOwner && (
              <Edit2 className="w-3 h-3 text-slate-400 hover:text-indigo-500 shrink-0" />
            )}
          </div>
        )}

        {/* Role Badge */}
        <div className="glass-panel px-2.5 py-1.5 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 hidden lg:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <Shield className="w-3 h-3" />
          <span>{userRole}</span>
        </div>

        {/* Save status pill */}
        <div className="glass-panel px-2.5 py-1.5 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {saveStatus === 'saving' ? (
            <>
              <RefreshCw className="w-3 h-3 text-indigo-500 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Saved</span>
            </>
          )}
        </div>

        {/* Version History Button */}
        <button
          onClick={onOpenHistory}
          title="Board Version History & Snapshots"
          className="glass-panel p-2 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden md:flex items-center gap-1 text-xs font-semibold"
        >
          <History className="w-3.5 h-3.5" />
          <span>History</span>
        </button>
      </div>

      {/* Right side: AI Assistant, Templates, Collaborator Stack, Share */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* AI Assistant Button (Glowing Primary) */}
        <button
          onClick={onOpenAi}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 animate-pulse"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {/* Templates Button */}
        <button
          onClick={onOpenTemplates}
          className="glass-panel px-3 py-2 rounded-2xl shadow-lg border border-slate-200/90 dark:border-slate-700/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden md:flex items-center gap-1.5 text-xs font-semibold"
        >
          <Layout className="w-3.5 h-3.5 text-indigo-500" />
          <span>Templates</span>
        </button>

        {/* Avatars Stack */}
        <div className="glass-panel px-3 py-1.5 rounded-2xl shadow-lg border border-slate-200/90 dark:border-slate-700/90 flex items-center gap-2">
          <div className="flex items-center -space-x-2 overflow-hidden">
            {participants.slice(0, 4).map((p, idx) => (
              <div
                key={p.socketId || idx}
                title={`${p.name || 'Participant'} (${p.role || 'editor'})`}
                className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[11px] font-bold text-white shadow-sm transition-transform hover:scale-110 hover:z-10"
                style={{ backgroundColor: p.avatarColor || '#6366f1' }}
              >
                {getInitials(p.name)}
              </div>
            ))}
            {participants.length > 4 && (
              <div className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold">
                +{participants.length - 4}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200 pl-1 border-l border-slate-200 dark:border-slate-700">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>{participants.length}</span>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={onOpenShare}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default CollaboratorsBar;
