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
import ShareModal from '../components/whiteboard/ShareModal';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import {
  Search,
  Plus,
  LayoutGrid,
  Sparkles,
  RefreshCw,
  FolderOpen,
  AlertCircle,
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [shareBoard, setShareBoard] = useState(null);
  const [renameBoard, setRenameBoard] = useState(null);
  const [deleteTargetBoard, setDeleteTargetBoard] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  // Toast notifications
  const [toast, setToast] = useState({ message: '', type: 'info' });

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

  // Handle board creation
  const handleCreateBoard = async ({ title, isPublic }) => {
    try {
      const res = await createWhiteboard({ title, isPublic });
      if (res.success && res.whiteboard) {
        setToast({ message: `Whiteboard "${res.whiteboard.title}" created!`, type: 'success' });
        navigate(`/board/${res.whiteboard.roomId}`);
      }
    } catch (err) {
      setToast({ message: 'Error creating whiteboard. Please try again.', type: 'error' });
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar onNewBoard={() => setCreateModalOpen(true)} />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          totalBoards={boards.length}
          onNewBoard={() => setCreateModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full">
          {/* Header & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Whiteboard Workspaces
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Welcome back, <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span>.
                Pick up where you left off or start a new real-time board.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search boards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Boards Grid or Empty State */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
              <p className="text-sm text-slate-500">Loading your whiteboards...</p>
            </div>
          ) : boards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {boards.map((board) => (
                <BoardCard
                  key={board._id || board.id}
                  board={board}
                  onRename={(b) => {
                    setRenameBoard(b);
                    setNewTitle(b.title);
                  }}
                  onDelete={(b) => setDeleteTargetBoard(b)}
                  onShare={(b) => setShareBoard(b)}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 px-6 glass-panel rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-inner">
                <FolderOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {search ? 'No whiteboards match your search' : 'No whiteboards created yet'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
                {search
                  ? `Try clearing your search "${search}" to see all whiteboards.`
                  : 'Start brainstorming, drawing architecture diagrams, or wireframing by creating your first board.'}
              </p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/25 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Whiteboard</span>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateBoard}
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
    </div>
  );
};

export default DashboardPage;
