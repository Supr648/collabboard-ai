import React, { useState, useEffect } from 'react';
import { Smile, Sparkles } from 'lucide-react';

const EMOJIS = ['👍', '❤️', '🚀', '🔥', '💡', '🎉'];

const LiveReactions = ({ onTriggerReaction, incomingReactions = [] }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Floating Reaction Trigger Button (Bottom Center Left) */}
      <div className="fixed bottom-20 left-6 z-40">
        <div className="relative">
          {menuOpen && (
            <div className="absolute bottom-12 left-0 glass-panel p-1.5 rounded-2xl shadow-2xl flex items-center gap-1 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150 z-50">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onTriggerReaction(emoji);
                    setMenuOpen(false);
                  }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-lg hover:scale-125 hover:bg-slate-100 dark:hover:bg-slate-800 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            title="React with Emoji"
            className="glass-panel p-2.5 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-700/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-transform hover:scale-110 flex items-center justify-center"
          >
            <Smile className="w-4 h-4 text-amber-500" />
          </button>
        </div>
      </div>

      {/* Floating Animated Reaction Particles Container */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
        {incomingReactions.map((r) => (
          <div
            key={r.id}
            className="absolute animate-float-up text-3xl select-none"
            style={{
              left: `${r.x}px`,
              bottom: '40px',
              animation: 'floatUp 2.8s cubic-bezier(0.25, 1, 0.5, 1) forwards',
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(0.6);
          }
          50% {
            opacity: 1;
            transform: translateY(-200px) scale(1.3) rotate(-8deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-400px) scale(1) rotate(12deg);
          }
        }
      `}</style>
    </>
  );
};

export default LiveReactions;
