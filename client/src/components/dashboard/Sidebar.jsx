import React from 'react';
import { motion } from 'framer-motion';
import { useWorkspace } from '../../context/WorkspaceContext';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import {
  LayoutDashboard,
  Clock,
  Share2,
  Plus,
  Sparkles,
  Layers,
  FolderLock,
  Bookmark,
  Users,
  Star,
  Command,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  GraduationCap,
  BookOpen,
  CheckSquare,
  Compass,
  Calendar,
  Vote,
  Kanban,
  Target,
  Zap,
} from 'lucide-react';

const Sidebar = ({
  activeTab,
  setActiveTab,
  totalBoards = 0,
  favoritesCount = 0,
  onNewBoard,
  onOpenTemplates,
  onOpenCommandPalette,
  onOpenShortcuts,
  onOpenOnboarding,
  onOpenCreateWorkspace,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { currentWorkspace } = useWorkspace();
  const wsType = currentWorkspace?.type || 'team';

  // Purpose-tailored navigation items
  const getNavItems = () => {
    switch (wsType) {
      case 'student':
        return [
          { id: 'all', label: 'Study Boards', icon: BookOpen, badge: totalBoards },
          { id: 'subjects', label: 'Subjects & Notes', icon: GraduationCap },
          { id: 'flashcards', label: 'Flashcards Decks', icon: Layers },
          { id: 'quizzes', label: 'AI Quizzes & Tests', icon: Sparkles },
          { id: 'revision', label: 'Revision Schedule', icon: Calendar },
          { id: 'favorites', label: 'Starred Materials', icon: Star, badge: favoritesCount },
        ];
      case 'teacher':
        return [
          { id: 'all', label: 'Lesson Boards', icon: BookOpen, badge: totalBoards },
          { id: 'classrooms', label: 'Classrooms & Students', icon: Compass },
          { id: 'assignments', label: 'Assignments & Deadlines', icon: CheckSquare },
          { id: 'templates', label: 'Teaching Templates', icon: Bookmark },
          { id: 'favorites', label: 'Favorite Lessons', icon: Star, badge: favoritesCount },
        ];
      case 'personal':
        return [
          { id: 'all', label: 'My Notes & Boards', icon: LayoutDashboard, badge: totalBoards },
          { id: 'planner', label: 'Daily & Weekly Plan', icon: Calendar },
          { id: 'goals', label: 'Goal Milestones', icon: Target },
          { id: 'habits', label: 'Habit Streaks', icon: Zap },
          { id: 'favorites', label: 'Starred Boards', icon: Star, badge: favoritesCount },
        ];
      case 'business':
      case 'team':
      default:
        return [
          { id: 'all', label: 'All Whiteboards', icon: LayoutDashboard, badge: totalBoards },
          { id: 'projects', label: 'Active Projects', icon: Kanban },
          { id: 'voting', label: 'Live Voting & Polls', icon: Vote },
          { id: 'favorites', label: 'Favorites', icon: Star, badge: favoritesCount },
          { id: 'recent', label: 'Recent Activity', icon: Clock },
          { id: 'templates', label: 'Templates Gallery', icon: Bookmark },
        ];
    }
  };

  const navItems = getNavItems();

  const onlineTeam = [
    { name: 'Alex M.', role: 'Architect', color: '#6366f1', status: 'online' },
    { name: 'Sarah K.', role: 'Product Lead', color: '#ec4899', status: 'online' },
    { name: 'David R.', role: 'Eng Lead', color: '#10b981', status: 'online' },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="border-r border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl p-3.5 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)] transition-colors select-none"
    >
      <div className="space-y-4">
        {/* Workspace Switcher */}
        <WorkspaceSwitcher
          isCollapsed={isCollapsed}
          onOpenCreateModal={onOpenCreateWorkspace}
        />

        {/* Create Board CTA */}
        <button
          onClick={onNewBoard}
          title="Create New Whiteboard"
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>New Whiteboard</span>}
        </button>

        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          title="Command Palette (Ctrl+K)"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Command className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            {!isCollapsed && <span>Command Palette</span>}
          </div>
          {!isCollapsed && (
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-[10px] font-mono font-bold text-slate-400 border border-slate-200 dark:border-slate-700">
              Ctrl K
            </kbd>
          )}
        </button>

        {/* Navigation list */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Navigation
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'templates' && onOpenTemplates) {
                    onOpenTemplates();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                title={item.label}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Recently Active Team Members */}
        {!isCollapsed && wsType !== 'personal' && (
          <div>
            <div className="px-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              <span>Online Collaborators</span>
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-1">
              {onlineTeam.map((mem) => (
                <div
                  key={mem.name}
                  className="flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                      style={{ backgroundColor: mem.color }}
                    >
                      {mem.name.slice(0, 1)}
                    </div>
                    <div className="truncate text-left">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                        {mem.name}
                      </p>
                      <p className="text-[10px] text-slate-400">{mem.role}</p>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer controls: Tour, Shortcuts & Collapse */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <button
          onClick={onOpenOnboarding}
          title="Product Tour"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
          {!isCollapsed && <span>Product Tour</span>}
        </button>

        <button
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts (?)"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
          {!isCollapsed && <span>Shortcuts Guide</span>}
        </button>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mt-1"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
