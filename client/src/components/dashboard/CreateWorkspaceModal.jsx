import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useWorkspace, WORKSPACE_METADATA } from '../../context/WorkspaceContext';
import { Sparkles, Layers, ArrowRight } from 'lucide-react';

const CreateWorkspaceModal = ({ isOpen, onClose }) => {
  const { createNewWorkspace } = useWorkspace();
  const [name, setName] = useState('');
  const [type, setType] = useState('student');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createNewWorkspace({
        name: name.trim(),
        type,
        description: description.trim(),
      });
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create workspace.');
    } finally {
      setLoading(false);
    }
  };

  const workspaceTypes = [
    { id: 'student', title: 'Student Learning Hub', desc: 'Study notes, flashcards, AI quizzes, and revision' },
    { id: 'teacher', title: 'Teacher Classroom', desc: 'Curriculum boards, assignments, and student reviews' },
    { id: 'team', title: 'Team Collaboration', desc: 'Sprint planning, project Kanban, and architecture' },
    { id: 'business', title: 'Business Enterprise', desc: 'Cross-functional initiatives and strategic roadmaps' },
    { id: 'personal', title: 'Personal Productivity', desc: 'Daily planner, goals, habit tracker, and notes' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Workspace" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Workspace Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Stanford CS106B Study Group or Fintech Core Eng"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Select Workspace Purpose
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {workspaceTypes.map((item) => {
              const meta = WORKSPACE_METADATA[item.id];
              const Icon = meta.icon;
              const isSelected = type === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${meta.gradient} flex items-center justify-center text-white shrink-0`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Description (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="What is this workspace dedicated to?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>{loading ? 'Creating...' : 'Create Workspace'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateWorkspaceModal;
