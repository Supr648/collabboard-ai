import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 shadow-inner animate-pulse">
          <Sparkles className="w-10 h-10" />
        </div>

        <h1 className="text-6xl sm:text-8xl font-black text-slate-900 dark:text-white tracking-tighter">
          404
        </h1>
        <h2 className="text-xl sm:text-2xl font-bold mt-2 text-slate-800 dark:text-slate-200">
          Whiteboard Not Found
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
          The canvas or page you're searching for might have been moved, deleted, or does not exist.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
          >
            <Home className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-panel border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Landing Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
