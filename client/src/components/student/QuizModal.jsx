import React, { useState } from 'react';
import Modal from '../common/Modal';
import { submitQuizAttempt } from '../../api/student';
import { CheckCircle2, XCircle, AlertCircle, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

const QuizModal = ({ isOpen, onClose, quiz, onQuizAttempted }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [attemptResult, setAttemptResult] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) return null;

  const questions = quiz.questions;
  const currentQ = questions[currentIdx];
  const userSelected = selectedAnswers[currentIdx];

  const handleSelectOption = (optIdx) => {
    if (userSelected !== undefined) return; // Already selected
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }));
    setShowExplanation(true);
  };

  const handleNext = async () => {
    setShowExplanation(false);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Calculate final score
      let score = 0;
      const weakTopics = [];
      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) {
          score++;
        } else {
          weakTopics.push(q.question.slice(0, 35) + '...');
        }
      });

      const total = questions.length;
      setSaving(true);
      try {
        const quizId = quiz._id || quiz.id;
        const res = await submitQuizAttempt(quizId, {
          score,
          total,
          weakTopics,
        });
        if (res.success && onQuizAttempted) {
          onQuizAttempted(res.deck);
        }
        setAttemptResult({ score, total, weakTopics });
        setIsCompleted(true);
        if (score / total >= 0.7) {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }
      } catch (err) {
        console.warn('Failed to save quiz attempt:', err.message);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setIsCompleted(false);
    setAttemptResult(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCompleted ? 'Quiz Results' : `${quiz.title} (${currentIdx + 1}/${questions.length})`}
      maxWidth="max-w-2xl"
    >
      {!isCompleted ? (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((option, optIdx) => {
              const isChosen = userSelected === optIdx;
              const isCorrect = optIdx === currentQ.correctIndex;
              let btnClass = 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/80 dark:bg-slate-900/80';

              if (userSelected !== undefined) {
                if (isCorrect) {
                  btnClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20';
                } else if (isChosen && !isCorrect) {
                  btnClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 ring-2 ring-rose-500/20';
                } else {
                  btnClass = 'opacity-40 border-slate-200 dark:border-slate-800';
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={userSelected !== undefined}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between text-xs sm:text-sm font-medium ${btnClass}`}
                >
                  <span>{option}</span>
                  {userSelected !== undefined && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                  )}
                  {userSelected !== undefined && isChosen && !isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer Explanation */}
          {showExplanation && (
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 animate-in fade-in duration-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-0.5">Explanation</p>
                <p className="leading-relaxed">{currentQ.explanation}</p>
              </div>
            </div>
          )}

          {/* Next Button */}
          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleNext}
              disabled={userSelected === undefined || saving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <span>{currentIdx === questions.length - 1 ? 'Complete Quiz' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Quiz Completed Screen */
        <div className="py-6 space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/25">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Quiz Completed!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              You scored {attemptResult?.score} out of {attemptResult?.total} ({Math.round(((attemptResult?.score || 0) / (attemptResult?.total || 1)) * 100)}%)
            </p>
          </div>

          {/* Weak Topics Identification */}
          {attemptResult?.weakTopics && attemptResult.weakTopics.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-left">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs mb-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Recommended Areas for Revision</span>
              </div>
              <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1">
                {attemptResult.weakTopics.map((topic, i) => (
                  <li key={i}>{topic}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleRestart}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default QuizModal;
