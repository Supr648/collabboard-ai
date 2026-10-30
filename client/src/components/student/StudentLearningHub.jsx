import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentSummary } from '../../api/student';
import { createWhiteboard } from '../../api/whiteboard';
import FlashcardModal from './FlashcardModal';
import QuizModal from './QuizModal';
import GenerateStudyMaterialModal from './GenerateStudyMaterialModal';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Layers,
  Award,
  AlertTriangle,
  Play,
  RotateCw,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const StudentLearningHub = ({ onOpenWhiteboard }) => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Modals
  const [activeFlashcardDeck, setActiveFlashcardDeck] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const res = await getStudentSummary();
      if (res.success) {
        setSummary(res);
      }
    } catch (e) {
      console.warn('Failed to load student summary:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleCreateMindMapOnBoard = async (topicTitle) => {
    try {
      const res = await createWhiteboard({
        title: `${topicTitle} – Study Mind Map`,
      });
      if (res.success && res.whiteboard) {
        navigate(`/board/${res.whiteboard.roomId}`);
      }
    } catch (e) {
      console.warn('Could not launch whiteboard:', e.message);
    }
  };

  const filteredDecks = (summary?.decks || []).filter((deck) => {
    if (activeFilter === 'flashcards') return deck.type === 'flashcards';
    if (activeFilter === 'quiz') return deck.type === 'quiz';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Student Overview Header & Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Decks */}
        <div className="p-4 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3.5 bg-white/50 dark:bg-slate-900/40">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {summary?.stats?.totalDecks || 0}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Study Decks
            </p>
          </div>
        </div>

        {/* Flashcard Mastery */}
        <div className="p-4 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3.5 bg-white/50 dark:bg-slate-900/40">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {summary?.stats?.masteryPercentage || 0}%
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Card Mastery ({summary?.stats?.masteredCards || 0}/{summary?.stats?.totalCards || 0})
            </p>
          </div>
        </div>

        {/* Average Quiz Score */}
        <div className="p-4 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3.5 bg-white/50 dark:bg-slate-900/40">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {summary?.stats?.averageQuizScore || 80}%
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Avg Quiz Performance
            </p>
          </div>
        </div>

        {/* AI Action CTA */}
        <button
          onClick={() => setGenerateModalOpen(true)}
          className="p-4 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between text-left"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">AI Learning Copilot</p>
            <p className="text-sm font-black mt-0.5">Generate Study Material</p>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>

      {/* Weak-Topics Revision Recommendations Alert */}
      {summary?.stats?.weakTopics && summary.stats.weakTopics.length > 0 && (
        <div className="p-4 rounded-3xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/70 to-orange-50/50 dark:from-amber-950/40 dark:to-orange-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Weak-Topic Identification Based on Quiz Results
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Suggested focus areas: <span className="font-semibold text-amber-700 dark:text-amber-300">{summary.stats.weakTopics.slice(0, 3).join(', ')}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setGenerateModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 self-start sm:self-center shadow-xs"
          >
            Generate Quiz on Weak Topics
          </button>
        </div>
      )}

      {/* Study Materials Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          {[
            { id: 'all', label: 'All Materials' },
            { id: 'flashcards', label: 'Flashcards Decks' },
            { id: 'quiz', label: 'Quizzes & Practice' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setGenerateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Study Deck</span>
        </button>
      </div>

      {/* Decks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : filteredDecks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
          {filteredDecks.map((deck) => {
            const isQuiz = deck.type === 'quiz';
            const itemsCount = isQuiz ? (deck.questions || []).length : (deck.cards || []).length;

            return (
              <div
                key={deck._id || deck.id}
                className="p-5 rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 hover:border-amber-400/60 dark:hover:border-amber-500/60 transition-all flex flex-col justify-between space-y-4 bg-white/60 dark:bg-slate-900/50 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                      {deck.subject}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {itemsCount} {isQuiz ? 'Questions' : 'Cards'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {deck.title}
                  </h4>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        if (isQuiz) {
                          setActiveQuiz(deck);
                        } else {
                          setActiveFlashcardDeck(deck);
                        }
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isQuiz ? 'Take Quiz' : 'Study Cards'}</span>
                    </button>

                    <button
                      onClick={() => handleCreateMindMapOnBoard(deck.title)}
                      title="Open visual canvas mind map for this topic"
                      className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>To Board</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 px-6 glass-panel rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/30">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            No study decks in this view
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
            Generate your first interactive quiz or flashcard deck using AI.
          </p>
          <button
            onClick={() => setGenerateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
          >
            Create Study Material
          </button>
        </div>
      )}

      {/* Review Modals */}
      {activeFlashcardDeck && (
        <FlashcardModal
          isOpen={!!activeFlashcardDeck}
          onClose={() => setActiveFlashcardDeck(null)}
          deck={activeFlashcardDeck}
          onDeckUpdated={() => loadSummary()}
        />
      )}

      {activeQuiz && (
        <QuizModal
          isOpen={!!activeQuiz}
          onClose={() => setActiveQuiz(null)}
          quiz={activeQuiz}
          onQuizAttempted={() => loadSummary()}
        />
      )}

      {generateModalOpen && (
        <GenerateStudyMaterialModal
          isOpen={generateModalOpen}
          onClose={() => setGenerateModalOpen(false)}
          onMaterialGenerated={(newDeck) => {
            loadSummary();
            if (newDeck.type === 'quiz') setActiveQuiz(newDeck);
            else setActiveFlashcardDeck(newDeck);
          }}
        />
      )}
    </div>
  );
};

export default StudentLearningHub;
