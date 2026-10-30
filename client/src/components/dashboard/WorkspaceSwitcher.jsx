import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace, WORKSPACE_METADATA } from '../../context/WorkspaceContext';
import {
  ChevronDown,
  Plus,
  Check,
  Settings,
  Sparkles,
  Layers,
  GraduationCap,
  Compass,
  Users,
  Briefcase,
  CalendarCheck,
} from 'lucide-react';

const WorkspaceSwitcher = ({ isCollapsed = false, onOpenCreateModal }) => {
  const { workspaces, currentWorkspace, switchWorkspace, workspaceMetadata } = useWorkspace();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const Icon = workspaceMetadata?.icon || Layers;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        title={currentWorkspace?.name || 'Switch Workspace'}
        className={`w-full flex items-center justify-between p-2 rounded-2xl border transition-all text-left ${
          dropdownOpen
            ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/70 dark:bg-slate-800/70'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${workspaceMetadata.gradient} flex items-center justify-center text-white shadow-sm shrink-0`}
          >
            <Icon className="w-4 h-4" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                {currentWorkspace?.name || 'My Workspace'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${workspaceMetadata.badgeBg}`}>
                  {workspaceMetadata.shortLabel}
                </span>
              </div>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180 text-indigo-500' : ''}`}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute left-0 top-full mt-2 w-72 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Your Workspaces ({workspaces.length})
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto py-1 space-y-1">
            {workspaces.map((ws) => {
              const meta = WORKSPACE_METADATA[ws.type] || WORKSPACE_METADATA.team;
              const ItemIcon = meta.icon;
              const isSelected = (currentWorkspace?._id || currentWorkspace?.id) === (ws._id || ws.id);

              return (
                <button
                  key={ws._id || ws.id}
                  onClick={() => {
                    switchWorkspace(ws._id || ws.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${meta.gradient} flex items-center justify-center text-white shrink-0`}
                    >
                      <ItemIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {ws.name}
                      </p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {meta.label}
                      </span>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Action: Create New Workspace */}
          <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setDropdownOpen(false);
                if (onOpenCreateModal) onOpenCreateModal();
              }}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSwitcher;
