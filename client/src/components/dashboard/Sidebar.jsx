import React from 'react';
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
} from 'lucide-react';

const Sidebar = ({
  activeTab,
  setActiveTab,
  totalBoards = 0,
  onNewBoard,
  onOpenTemplates,
  collaborators = [],
}) => {
  const navItems = [
    { id: 'all', label: 'All Whiteboards', icon: LayoutDashboard },
    { id: 'recent', label: 'Recent Activity', icon: Clock },
    { id: 'my', label: 'My Whiteboards', icon: FolderLock },
    { id: 'shared', label: 'Shared with Me', icon: Share2 },
    { id: 'templates', label: 'Templates Gallery', icon: Bookmark },
  ];

  const onlineTeam = [
    { name: 'Alex M.', role: 'Architect', color: '#6366f1', status: 'online' },
    { name: 'Sarah K.', role: 'Product Lead', color: '#ec4899', status: 'online' },
    { name: 'David R.', role: 'Eng Lead', color: '#10b981', status: 'online' },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Create Board Primary CTA */}
        <button
          onClick={onNewBoard}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Whiteboard</span>
        </button>

        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Workspaces
          </p>
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.id === 'all' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                    {totalBoards}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Recently Active Team Members */}
        <div>
          <div className="px-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            <span>Team Members</span>
            <Users className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-1.5">
            {onlineTeam.map((mem) => (
              <div
                key={mem.name}
                className="flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: mem.color }}
                  >
                    {mem.name[0]}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {mem.name}
                    </span>
                    <span className="text-[10px] text-slate-400">{mem.role}</span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CollabBoard AI banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/50 dark:border-indigo-900/50 text-left">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wide">CollabBoard AI</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Type prompts on any canvas to generate system architecture diagrams, flowcharts, and mind maps.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
