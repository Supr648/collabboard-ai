import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Tag,
  ArrowRight,
  ArrowLeft,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import { getBoardTasks, createTask, updateTask, deleteTask } from '../../api/tasks';

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: 'border-slate-500/40 bg-slate-500/5', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
  { id: 'in_progress', title: 'In Progress', color: 'border-blue-500/40 bg-blue-500/5', badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' },
  { id: 'in_review', title: 'In Review', color: 'border-purple-500/40 bg-purple-500/5', badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' },
  { id: 'done', title: 'Done', color: 'border-emerald-500/40 bg-emerald-500/5', badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' },
];

const PRIORITY_BADGES = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  urgent: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

const TasksModal = ({ isOpen, onClose, boardId, initialTaskData = null, onClearInitial = () => {} }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskStatus, setNewTaskStatus] = useState('backlog');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Fetch tasks
  const fetchTasks = async () => {
    if (!boardId) return;
    try {
      setLoading(true);
      const res = await getBoardTasks(boardId);
      if (res.success && res.tasks) {
        setTasks(res.tasks);
      }
    } catch (err) {
      console.warn('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen, boardId]);

  // Handle incoming sticky note conversion
  useEffect(() => {
    if (initialTaskData && isOpen) {
      setIsCreating(true);
      setNewTaskTitle(initialTaskData.title || '');
      setNewTaskDesc(initialTaskData.description || '');
      setNewTaskPriority(initialTaskData.priority || 'medium');
      onClearInitial();
    }
  }, [initialTaskData, isOpen]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !boardId) return;

    try {
      const res = await createTask({
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        priority: newTaskPriority,
        status: newTaskStatus,
        dueDate: newTaskDueDate,
        boardId,
      });

      if (res.success && res.task) {
        setTasks((prev) => [res.task, ...prev]);
        setNewTaskTitle('');
        setNewTaskDesc('');
        setIsCreating(false);
      }
    } catch (err) {
      alert('Failed to create task. Please try again.');
    }
  };

  const handleStatusShift = async (task, direction) => {
    const colOrder = ['backlog', 'in_progress', 'in_review', 'done'];
    const curIdx = colOrder.indexOf(task.status);
    const targetIdx = direction === 'next' ? curIdx + 1 : curIdx - 1;

    if (targetIdx < 0 || targetIdx >= colOrder.length) return;
    const newStatus = colOrder[targetIdx];

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id || t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTask(task._id || task.id, { status: newStatus });
    } catch (err) {
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    setTasks((prev) => prev.filter((t) => (t._id || t.id) !== taskId));
    try {
      await deleteTask(taskId);
    } catch (err) {
      fetchTasks();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Project Tasks & Kanban
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                  {tasks.length} Total
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track actionable team deliverables converted from whiteboard brainstorming notes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreating ? 'Cancel' : 'New Task'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* New Task Inline Form */}
        {isCreating && (
          <form
            onSubmit={handleCreateSubmit}
            className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/30 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-150"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                autoFocus
                placeholder="Task title (e.g. Implement WebSocket rate limiter)..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                required
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="low">Priority: Low</option>
                <option value="medium">Priority: Medium</option>
                <option value="high">Priority: High</option>
                <option value="urgent">Priority: Urgent</option>
              </select>
              <select
                value={newTaskStatus}
                onChange={(e) => setNewTaskStatus(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="backlog">Stage: Backlog</option>
                <option value="in_progress">Stage: In Progress</option>
                <option value="in_review">Stage: In Review</option>
                <option value="done">Stage: Done</option>
              </select>
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Optional description / acceptance criteria..."
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                Save Task
              </button>
            </div>
          </form>
        )}

        {/* Kanban Board Columns */}
        <div className="flex-1 p-6 overflow-x-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className={`flex flex-col rounded-2xl border p-4 ${col.color} min-w-[240px]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {col.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${col.badge}`}>
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[55vh] pr-1">
                  {colTasks.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-slate-400 text-xs">
                      No tasks in {col.title}
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const taskId = task._id || task.id;
                      const priorityStyle = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;

                      return (
                        <div
                          key={taskId}
                          className="group bg-white dark:bg-slate-800/90 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-700/80 hover:shadow-md transition-all flex flex-col gap-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-slate-900 dark:text-white leading-snug">
                              {task.title}
                            </span>
                            <button
                              onClick={() => handleDeleteTask(taskId)}
                              title="Delete task"
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {task.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/50 text-[10px]">
                            <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${priorityStyle}`}>
                              {task.priority}
                            </span>

                            {task.dueDate && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <Calendar className="w-3 h-3" />
                                {task.dueDate}
                              </span>
                            )}
                          </div>

                          {/* Quick Move Buttons */}
                          <div className="flex items-center justify-between pt-1">
                            <button
                              disabled={col.id === 'backlog'}
                              onClick={() => handleStatusShift(task, 'prev')}
                              title="Move left"
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-20 disabled:hover:text-slate-400 transition-colors"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {col.title}
                            </span>
                            <button
                              disabled={col.id === 'done'}
                              onClick={() => handleStatusShift(task, 'next')}
                              title="Move right"
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-20 disabled:hover:text-slate-400 transition-colors"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Tip: Right-click any sticky note on the canvas and choose <strong>"Convert to Task"</strong> to add it instantly here!</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TasksModal;
