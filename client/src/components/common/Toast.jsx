import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 3200 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />,
  };

  return (
    <AnimatePresence>
      {message && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24, stiffness: 350 }}
            className="pointer-events-auto relative overflow-hidden glass-panel px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-200/90 dark:border-slate-700/90 max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl"
          >
            {icons[type] || icons.info}
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex-1 pr-2">
              {message}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Countdown progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              className={`absolute bottom-0 left-0 h-0.5 ${
                type === 'success'
                  ? 'bg-emerald-500'
                  : type === 'error'
                  ? 'bg-rose-500'
                  : 'bg-indigo-500'
              }`}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
