import React, { useState } from 'react';
import Modal from '../common/Modal';
import { generateAIQuiz, generateAIFlashcards } from '../../api/student';
import { Sparkles, BookOpen, Layers, ArrowRight } from 'lucide-react';

const GenerateStudyMaterialModal = ({ isOpen, onClose, onMaterialGenerated }) => {
  const [mode, setMode] = useState('quiz'); // 'quiz' or 'flashcards'
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim() && !notes.trim()) {
      setError('Please provide a topic name or study notes');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let res;
      if (mode === 'quiz') {
        res = await generateAIQuiz({ topic: topic.trim(), notes: notes.trim(), subject: subject.trim() });
      } else {
        res = await generateAIFlashcards({ topic: topic.trim(), notes: notes.trim(), subject: subject.trim() });
      }

      if (res.success && res.deck) {
        if (onMaterialGenerated) {
          onMaterialGenerated(res.deck);
        }
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate study materials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate AI Study Materials"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('quiz')}
            className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
              mode === 'quiz'
                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">AI Practice Quiz</p>
              <p className="text-[10px] text-slate-500">Multiple-choice test</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMode('flashcards')}
            className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
              mode === 'flashcards'
                ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/60 ring-2 ring-amber-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Flashcard Deck</p>
              <p className="text-[10px] text-slate-500">Active recall cards</p>
            </div>
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Subject or Category
          </label>
          <input
            type="text"
            placeholder="e.g. Computer Science, Neuroscience, Economics"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Topic Title
          </label>
          <input
            type="text"
            placeholder="e.g. Distributed Consensus & Raft Protocol"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Study Notes or Lecture Transcript (Optional)
          </label>
          <textarea
            rows="3"
            placeholder="Paste raw notes, summary paragraphs, or textbook excerpt..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
            <span>{loading ? 'Synthesizing...' : `Generate ${mode === 'quiz' ? 'Quiz' : 'Flashcards'}`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GenerateStudyMaterialModal;
