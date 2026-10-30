import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
  Share2,
  Calendar,
  Clock,
  Sparkles,
  Star,
} from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

const BoardCard = ({
  board,
  onRename,
  onDelete,
  onShare,
  onDuplicate,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const elementCount = Array.isArray(board.elements) ? board.elements.length : 0;
  const boardId = board._id || board.id || board.roomId;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
      className="group relative glass-panel rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-400 dark:hover:border-indigo-500/60 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl"
    >
      {/* Thumbnail Preview Area */}
      <Link
        to={`/board/${board.roomId}`}
        className="block relative aspect-video w-full bg-slate-100 dark:bg-slate-900/80 overflow-hidden cursor-pointer"
      >
        {board.thumbnail ? (
          <img
            src={board.thumbnail}
            alt={board.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-slate-400 dark:text-slate-600 bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20">
            <Sparkles className="w-8 h-8 mb-2 text-indigo-400/60 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">
              {elementCount > 0 ? `${elementCount} elements drawn` : 'Clean vector canvas'}
            </span>
          </div>
        )}

        {/* Favorite Star badge button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onToggleFavorite) onToggleFavorite(boardId);
          }}
          className={`absolute top-3 left-3 p-2 rounded-xl backdrop-blur-md transition-all z-10 ${
            isFavorite
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 opacity-100'
              : 'bg-slate-900/40 text-white/80 opacity-0 group-hover:opacity-100 hover:bg-slate-900/70 hover:text-white'
          }`}
          title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Hover overlay with Open CTA */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-4 py-2 rounded-2xl bg-white text-slate-900 text-xs font-bold shadow-xl flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            Open Canvas <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/board/${board.roomId}`}
            className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
          >
            {board.title || 'Untitled Whiteboard'}
          </Link>

          {/* Action Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-1 w-48 rounded-2xl glass-panel shadow-2xl py-1.5 z-30 border border-slate-200/90 dark:border-slate-700/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl"
                >
                  <Link
                    to={`/board/${board.roomId}`}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                    Open Board
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onShare(board);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                    Share Invite
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      if (onToggleFavorite) onToggleFavorite(boardId);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    {isFavorite ? 'Unfavorite' : 'Add to Favorites'}
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onRename(board);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                    Rename
                  </button>
                  {onDuplicate && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDuplicate(board);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      Duplicate Board
                    </button>
                  )}
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(board);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Board
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Timestamps */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Updated {formatRelativeTime(board.updatedAt || board.createdAt)}</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">
            {board.roomId ? board.roomId.slice(0, 8) : 'room'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default BoardCard;
