import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Sparkles,
  LayoutDashboard,
  Moon,
  Sun,
  Layers,
  CheckSquare,
  HelpCircle,
  Clock,
  ArrowRight,
  Bookmark,
  Share2,
  Bot,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getWhiteboards } from '../../api/whiteboard';

const CommandPalette = ({
  isOpen,
  onClose,
  onOpenTemplates,
  onNewBoard,
  onOpenShortcuts,
  onOpenTasks,
  onOpenAi,
  customCommands = [],
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [boards, setBoards] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);

      // Fetch boards for quick search
      if (isAuthenticated) {
        getWhiteboards()
          .then((res) => {
            if (res.success && res.whiteboards) {
              setBoards(res.whiteboards);
            }
          })
          .catch(() => {});
      }
    }
  }, [isOpen, isAuthenticated]);

  // Command items
  const staticCommands = [
    {
      id: 'cmd_new_board',
      category: 'Actions',
      title: 'Create New Whiteboard',
      subtitle: 'Open a blank collaborative vector canvas',
      icon: Plus,
      action: () => {
        if (onNewBoard) onNewBoard();
        else navigate('/dashboard');
      },
    },
    {
      id: 'cmd_templates',
      category: 'Actions',
      title: 'Open Templates Gallery',
      subtitle: 'System architecture, mind maps, agile kanban & flowcharts',
      icon: Bookmark,
      action: () => {
        if (onOpenTemplates) onOpenTemplates();
      },
    },
    {
      id: 'cmd_tasks',
      category: 'Project Management',
      title: 'Open Kanban Tasks & Deliverables',
      subtitle: 'View, organize, and assign board tasks',
      icon: CheckSquare,
      action: () => {
        if (onOpenTasks) onOpenTasks();
      },
    },
    {
      id: 'cmd_ai_studio',
      category: 'AI Copilot',
      title: 'AI Synthesis Studio',
      subtitle: 'Generate visual diagrams, flowcharts, and mind maps',
      icon: Sparkles,
      action: () => {
        if (onOpenAi) onOpenAi();
      },
    },
    {
      id: 'cmd_dashboard',
      category: 'Navigation',
      title: 'Go to Dashboard',
      subtitle: 'Browse all workspaces, recent boards, and team assets',
      icon: LayoutDashboard,
      action: () => navigate('/dashboard'),
    },
    {
      id: 'cmd_toggle_theme',
      category: 'Preferences',
      title: `Toggle Theme (Currently ${theme === 'dark' ? 'Dark' : 'Light'})`,
      subtitle: 'Switch between Dark and Light mode themes',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => toggleTheme(),
    },
    {
      id: 'cmd_shortcuts',
      category: 'Help',
      title: 'Keyboard Shortcuts Guide',
      subtitle: 'View all keyboard accelerators and shortcuts',
      icon: HelpCircle,
      action: () => {
        if (onOpenShortcuts) onOpenShortcuts();
      },
    },
  ];

  // Dynamic board items
  const boardCommands = boards.map((b) => ({
    id: `board_${b.roomId}`,
    category: 'Whiteboards',
    title: b.title || 'Untitled Whiteboard',
    subtitle: `Updated ${new Date(b.updatedAt).toLocaleDateString()}`,
    icon: Layers,
    action: () => navigate(`/board/${b.roomId}`),
  }));

  const allItems = [...customCommands, ...staticCommands, ...boardCommands];

  const filteredItems = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredItems[selectedIndex];
      if (target) {
        onClose();
        target.action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-xl glass-panel rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-700/90 overflow-hidden z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl flex flex-col max-h-[70vh]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-5 h-5 text-indigo-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search boards..."
                className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                ESC
              </span>
            </div>

            {/* Results List */}
            <div className="p-2 overflow-y-auto space-y-1">
              {filteredItems.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  No matching commands or boards found.
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onClose();
                        item.action();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-xs font-bold truncate leading-tight">{item.title}</p>
                          {item.subtitle && (
                            <p
                              className={`text-[11px] truncate ${
                                isSelected ? 'text-indigo-100' : 'text-slate-400'
                              }`}
                            >
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer hints */}
            <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 text-[10px] font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
              <span className="text-indigo-500 font-semibold">CollabBoard AI Command Hub</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
