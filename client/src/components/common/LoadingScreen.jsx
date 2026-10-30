import React from 'react';
import { Sparkles } from 'lucide-react';

const LoadingScreen = ({ message = 'Loading workspace environment...' }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex flex-col items-center gap-4 relative z-10">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 animate-pulse">
          <Sparkles className="w-7 h-7" />
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            CollabBoard AI
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {message}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
