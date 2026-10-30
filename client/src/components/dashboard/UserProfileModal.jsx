import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Sparkles, Check, LogOut, Shield, Loader2, AlertCircle } from 'lucide-react';

const AVATAR_COLORS = [
  '#6366f1', '#ec4899', '#8b5cf6', '#10b981',
  '#f59e0b', '#3b82f6', '#14b8a6', '#ef4444', '#06b6d4',
];

const UserProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUserProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [selectedColor, setSelectedColor] = useState(user?.avatarColor || '#6366f1');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Display name is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      if (updateUserProfile) {
        await updateUserProfile({ name: name.trim(), avatarColor: selectedColor });
      } else if (user) {
        user.name = name.trim();
        user.avatarColor = selectedColor;
      }
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile & Settings" maxWidth="max-w-lg">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black uppercase shadow-md transition-transform hover:scale-105"
            style={{ backgroundColor: selectedColor }}
          >
            {name ? name[0] : 'U'}
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{name || 'Workspace Member'}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Shield className="w-3 h-3" /> Pro Workspace Member
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Display Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            />
          </div>
        </div>

        {/* Avatar Color Picker */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Collaborator Cursor & Avatar Color
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedColor(c)}
                className={`w-7 h-7 rounded-xl transition-transform hover:scale-110 flex items-center justify-center cursor-pointer ${
                  selectedColor === c ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : ''
                }`}
                style={{ backgroundColor: c }}
                title={`Color ${c}`}
              >
                {selectedColor === c && <Check className="w-4 h-4 text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* AI Preferences info */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>CollabBoard AI Engine</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Connected to the backend AI diagram generator, architecture flowcharts, and sticky note summarizer.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default UserProfileModal;
