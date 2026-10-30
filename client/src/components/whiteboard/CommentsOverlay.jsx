import React, { useState } from 'react';
import { MessageSquare, Check, X, Send, User } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

const CommentsOverlay = ({
  comments = [],
  onAddComment,
  onResolveComment,
  zoom = 1,
  pan = { x: 0, y: 0 },
  currentUser,
}) => {
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const activeComment = comments.find((c) => c.id === activeCommentId);

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeComment) return;

    const newReply = {
      id: `rep_${Date.now()}`,
      author: currentUser?.name || 'Collaborator',
      avatarColor: currentUser?.avatarColor || '#6366f1',
      text: replyText.trim(),
      createdAt: new Date().toISOString(),
    };

    activeComment.replies = [...(activeComment.replies || []), newReply];
    onAddComment(activeComment);
    setReplyText('');
  };

  return (
    <>
      {/* Pinned Comment Badges on Canvas */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-30">
        {comments.map((c) => {
          if (c.resolved) return null;

          const screenX = c.x * zoom + pan.x;
          const screenY = c.y * zoom + pan.y;

          return (
            <div
              key={c.id}
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125"
              style={{
                left: `${screenX}px`,
                top: `${screenY}px`,
              }}
              onClick={() => setActiveCommentId(c.id)}
            >
              <div
                className="w-7 h-7 rounded-full shadow-xl flex items-center justify-center text-white border-2 border-white ring-2 ring-indigo-500/40"
                style={{ backgroundColor: c.authorColor || '#6366f1' }}
                title={`Comment by ${c.author}: ${c.text.slice(0, 25)}...`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Comment Thread Drawer */}
      {activeComment && (
        <div className="fixed bottom-24 right-20 z-50 w-80 rounded-2xl glass-panel shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-150 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                style={{ backgroundColor: activeComment.authorColor || '#6366f1' }}
              >
                {activeComment.author ? activeComment.author[0] : 'U'}
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {activeComment.author}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  onResolveComment(activeComment.id);
                  setActiveCommentId(null);
                }}
                title="Mark Resolved"
                className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Resolve</span>
              </button>
              <button
                onClick={() => setActiveCommentId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
            {/* Main comment */}
            <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {activeComment.text}
            </div>

            {/* Replies */}
            {activeComment.replies && activeComment.replies.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {activeComment.replies.map((r) => (
                  <div key={r.id} className="text-[11px] p-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/60">
                    <span className="font-bold text-slate-900 dark:text-white block">{r.author}</span>
                    <span className="text-slate-600 dark:text-slate-300">{r.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reply input */}
          <form onSubmit={handleSendReply} className="p-2.5 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="p-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default CommentsOverlay;
