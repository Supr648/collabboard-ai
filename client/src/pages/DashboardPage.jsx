import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getWhiteboards,
  createWhiteboard,
  updateWhiteboard,
  deleteWhiteboard,
} from '../api/whiteboard';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/dashboard/Sidebar';
import BoardCard from '../components/dashboard/BoardCard';
import CreateBoardModal from '../components/dashboard/CreateBoardModal';
import TemplatesModal, { TEMPLATES } from '../components/dashboard/TemplatesModal';
import ShareModal from '../components/whiteboard/ShareModal';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import PageTransition from '../components/common/PageTransition';
import CommandPalette from '../components/common/CommandPalette';
import ShortcutsModal from '../components/common/ShortcutsModal';
import OnboardingModal from '../components/common/OnboardingModal';
import {
  Search,
  Plus,
  Sparkles,
  RefreshCw,
  FolderOpen,
  Layout,
  Clock,
  Layers,
  Users,
  BrainCircuit,
  Server,
  Kanban,
  GitFork,
  ArrowRight,
  Star,
  Command,
  HelpCircle,
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('collabboard_favs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Modals & Panels state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [shareBoard, setShareBoard] = useState(null);
  const [renameBoard, setRenameBoard] = useState(null);
  const [deleteTargetBoard, setDeleteTargetBoard] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState({ message: '', type: 'info' });

  // Check onboarding on initial visit
  useEffect(() => {
    const hasSeen = localStorage.getItem('collabboard_onboarded');
    if (!hasSeen) {
      setOnboardingModalOpen(true);
    }
  }, []);

  // Global Keyboard Shortcuts (Ctrl+K / Cmd+K and ?)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle favorite board
  const toggleFavorite = (boardId) => {
    setFavorites((prev) => {
      const exists = prev.includes(boardId);
      const next = exists ? prev.filter((id) => id !== boardId) : [...prev, boardId];
      try {
        localStorage.setItem('collabboard_favs', JSON.stringify(next));
      } catch {}
      setToast({
        message: exists ? 'Removed from favorites' : 'Added to favorites ⭐',
        type: exists ? 'info' : 'success',
      });
      return next;
    });
  };

  // Fetch whiteboards
  const loadBoards = async (searchTerm = '') => {
    try {
      setLoading(true);
      const res = await getWhiteboards(searchTerm);
      if (res.success) {
        setBoards(res.whiteboards || []);
      }
    } catch (err) {
      setToast({ message: 'Failed to load whiteboards. Refreshing...', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoards(search);
  }, [search]);

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Filter boards based on active tab
  const getFilteredBoards = () => {
    const currentUserId = user?._id || user?.id;
    let list = [...boards];

    if (activeTab === 'favorites') {
      list = list.filter((b) => favorites.includes(b._id || b.id || b.roomId));
    } else if (activeTab === 'recent') {
      list = list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } else if (activeTab === 'my') {
      list = list.filter((b) => {
        const ownerId = b.owner?._id || b.owner;
        return ownerId === currentUserId;
      });
    } else if (activeTab === 'shared') {
      list = list.filter((b) => {
        const ownerId = b.owner?._id || b.owner;
        return ownerId !== currentUserId;
      });
    }

    return list;
  };

  // Handle board creation
  const handleCreateBoard = async ({ title, isPublic, elements = [] }) => {
    try {
      const res = await createWhiteboard({ title, isPublic });
      if (res.success && res.whiteboard) {
        if (elements && elements.length > 0) {
          // If created from template, elements will be auto-saved on board load
          sessionStorage.setItem(`init_elements_${res.whiteboard.roomId}`, JSON.stringify(elements));
        }
        setToast({ message: `Whiteboard "${res.whiteboard.title}" created!`, type: 'success' });
        navigate(`/board/${res.whiteboard.roomId}`);
      }
    } catch (err) {
      setToast({ message: 'Error creating whiteboard. Please try again.', type: 'error' });
    }
  };

  // Handle template selection
  const handleSelectTemplate = async (template) => {
    const elements = template.generateElements();
    await handleCreateBoard({
      title: `${template.title} Workspace`,
      isPublic: true,
      elements,
    });
  };

  // Duplicate a board
  const handleDuplicateBoard = async (boardToCopy) => {
    try {
      const elementsCopy = boardToCopy.elements || [];
      const res = await createWhiteboard({
        title: `Copy of ${boardToCopy.title || 'Whiteboard'}`,
        isPublic: boardToCopy.isPublic !== undefined ? boardToCopy.isPublic : true,
      });

      if (res.success && res.whiteboard) {
        sessionStorage.setItem(`init_elements_${res.whiteboard.roomId}`, JSON.stringify(elementsCopy));
        setToast({ message: `Board duplicated! Opening copy...`, type: 'success' });
        navigate(`/board/${res.whiteboard.roomId}`);
      }
    } catch (err) {
      setToast({ message: 'Failed to duplicate board', type: 'error' });
    }
  };

  // Handle board rename
  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renameBoard || !newTitle.trim()) return;

    try {
      const res = await updateWhiteboard(renameBoard._id || renameBoard.id, {
        title: newTitle.trim(),
      });
      if (res.success) {
        setBoards((prev) =>
          prev.map((b) => (b._id === renameBoard._id || b.id === renameBoard.id ? res.whiteboard : b))
        );
        setToast({ message: 'Board renamed successfully', type: 'success' });
      }
    } catch (err) {
      setToast({ message: 'Failed to rename whiteboard', type: 'error' });
    } finally {
      setRenameBoard(null);
      setNewTitle('');
    }
  };

  // Handle board deletion
  const handleDeleteConfirm = async () => {
    if (!deleteTargetBoard) return;

    try {
      const id = deleteTargetBoard._id || deleteTargetBoard.id;
      const res = await deleteWhiteboard(id);
      if (res.success) {
        setBoards((prev) => prev.filter((b) => (b._id || b.id) !== id));
        setToast({ message: 'Whiteboard deleted', type: 'info' });
      }
    } catch (err) {
      setToast({ message: 'Failed to delete board. Only the owner can delete.', type: 'error' });
    } finally {
      setDeleteTargetBoard(null);
    }
  };

  // Stats calculation
  const totalElementsDrawn = boards.reduce((acc, b) => acc + (b.elements?.length || 0), 0);
  const filteredBoards = getFilteredBoards();

  return (
    <PageTransition className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        onNewBoard={() => setCreateModalOpen(true)}
        onOpenTemplates={() => setTemplatesModalOpen(true)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          totalBoards={boards.length}
          favoritesCount={boards.filter((b) => favorites.includes(b._id || b.id || b.roomId)).length}
          onNewBoard={() => setCreateModalOpen(true)}
          onOpenTemplates={() => setTemplatesModalOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenShortcuts={() => setShortcutsModalOpen(true)}
          onOpenOnboarding={() => setOnboardingModalOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-8">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {getGreeting()},
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {user?.name || 'Architect'} 👋
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Intelligent Collaborative Workspace
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Create infinite canvases, design cloud architectures, and synthesize diagrams with CollabBoard AI.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-all"
                title="Command Palette (Ctrl+K)"
              >
                <Command className="w-3.5 h-3.5 text-indigo-500" />
                <span>Commands</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-400">
                  Ctrl K
                </kbd>
              </button>
              <button
                onClick={() => setTemplatesModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Layout className="w-4 h-4 text-indigo-500" />
                <span>Templates</span>
              </button>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>New Board</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex items-center gap-3.5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Boards</p>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{boards.length}</h3>
              </div>
            </div>

            <div className="p-4 rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex items-center gap-3.5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Favorites</p>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{favorites.length}</h3>
              </div>
            </div>

            <div className="p-4 rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex items-center gap-3.5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Online Team</p>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">3 Active</h3>
              </div>
            </div>

            <div className="p-4 rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex items-center gap-3.5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
              <div className="w-10 h-10 rounded-2xl bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">AI Assistant</p>
                <h3 className="text-lg font-black text-indigo-600 dark:text-indigo-400">Connected</h3>
              </div>
            </div>
          </div>

          {/* Templates Quick-Start Carousel */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Start from a Template</span>
              </h3>
              <button
                onClick={() => setTemplatesModalOpen(true)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View all 4 blueprints</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TEMPLATES.slice(0, 4).map((tpl) => {
                const Icon = tpl.icon;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className="p-3.5 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500 hover:shadow-xl transition-all cursor-pointer group text-left bg-white/60 dark:bg-slate-900/50 backdrop-blur-md"
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white mb-2 shadow-sm group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: tpl.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {tpl.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {tpl.category}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search & Tabs Filtering */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              {/* Tab Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All Boards' },
                  { id: 'favorites', label: 'Starred' },
                  { id: 'recent', label: 'Recently Edited' },
                  { id: 'my', label: 'My Boards' },
                  { id: 'shared', label: 'Shared with Me' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Filter boards (or Ctrl+K)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Boards Grid, Skeleton Loader, or Empty State */}
            <div className="mt-6">
              {loading ? (
                /* Shimmer Skeleton Cards */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="glass-panel rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 p-4 space-y-4 animate-pulse bg-white/40 dark:bg-slate-900/40"
                    >
                      <div className="aspect-video w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4" />
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredBoards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                  {filteredBoards.map((board) => (
                    <BoardCard
                      key={board._id || board.id}
                      board={board}
                      isFavorite={favorites.includes(board._id || board.id || board.roomId)}
                      onToggleFavorite={toggleFavorite}
                      onRename={(b) => {
                        setRenameBoard(b);
                        setNewTitle(b.title);
                      }}
                      onDelete={(b) => setDeleteTargetBoard(b)}
                      onShare={(b) => setShareBoard(b)}
                      onDuplicate={handleDuplicateBoard}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 px-6 glass-panel rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/30">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-inner">
                    <FolderOpen className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {search ? 'No whiteboards match your filter' : 'No whiteboards found in this view'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
                    {search
                      ? `Clear "${search}" to see all whiteboards.`
                      : 'Create your first collaborative board or start with an AI architecture template.'}
                  </p>
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/25 transition-all hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Whiteboard</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateBoard}
      />

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenTemplates={() => setTemplatesModalOpen(true)}
        onNewBoard={() => setCreateModalOpen(true)}
        onOpenShortcuts={() => setShortcutsModalOpen(true)}
      />

      {/* Keyboard Shortcuts Guide Modal (?) */}
      <ShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />

      {/* Interactive Onboarding Tour */}
      <OnboardingModal
        isOpen={onboardingModalOpen}
        onClose={() => setOnboardingModalOpen(false)}
      />

      {/* Share Modal */}
      {shareBoard && (
        <ShareModal
          isOpen={!!shareBoard}
          onClose={() => setShareBoard(null)}
          roomId={shareBoard.roomId}
          title={shareBoard.title}
        />
      )}

      {/* Rename Modal */}
      {renameBoard && (
        <Modal
          isOpen={!!renameBoard}
          onClose={() => setRenameBoard(null)}
          title="Rename Whiteboard"
        >
          <form onSubmit={handleRenameSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                New Title
              </label>
              <input
                type="text"
                required
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRenameBoard(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetBoard && (
        <Modal
          isOpen={!!deleteTargetBoard}
          onClose={() => setDeleteTargetBoard(null)}
          title="Delete Whiteboard?"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to permanently delete{' '}
              <span className="font-bold text-slate-900 dark:text-white">"{deleteTargetBoard.title}"</span>?
              This action cannot be undone and will remove all drawings.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetBoard(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Delete Whiteboard
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'info' })}
        />
      )}
    </PageTransition>
  );
};

export default DashboardPage;
