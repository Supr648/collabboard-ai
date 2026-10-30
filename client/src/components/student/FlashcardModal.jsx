import React, { useState } from 'react';
import Modal from '../common/Modal';
import { updateCardMastery } from '../../api/student';
import { ChevronLeft, ChevronRight, RotateCw, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

const FlashcardModal = ({ isOpen, onClose, deck, onDeckUpdated }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!deck || !deck.cards || deck.cards.length === 0) return null;

  const cards = deck.cards;
  const currentCard = cards[currentIndex] || cards[0];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSetMastery = async (score) => {
    try {
      setSaving(true);
      const deckId = deck._id || deck.id;
      const res = await updateCardMastery(deckId, currentIndex, score);
      if (res.success && onDeckUpdated) {
        onDeckUpdated(res.deck);
      }
      handleNext();
    } catch (e) {
      console.warn('Failed to update card mastery:', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${deck.title} (${currentIndex + 1}/${cards.length})`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-indigo-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>

        {/* 3D Flip Card Container */}
        <div
          onClick={() => setIsFlipped((prev) => !prev)}
          className="relative h-72 w-full cursor-pointer rounded-3xl p-8 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white/90 to-amber-50/50 dark:from-slate-900/90 dark:to-slate-800/50 shadow-xl flex flex-col justify-between items-center text-center transition-all hover:border-amber-400 select-none"
        >
          <div className="w-full flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span className="uppercase tracking-wider">
              {isFlipped ? 'Answer (Click to flip)' : 'Question (Click to flip)'}
            </span>
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Flip Card</span>
            </div>
          </div>

          <div className="my-auto px-4 max-h-40 overflow-y-auto">
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">
              Mastery: {currentCard.masteryScore || 0}/5
            </span>
          </div>
        </div>

        {/* Mastery Rating Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleSetMastery(1)}
            disabled={saving}
            className="py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/80 bg-rose-50/60 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all"
          >
            Needs Review (1)
          </button>
          <button
            onClick={() => handleSetMastery(3)}
            disabled={saving}
            className="py-2.5 px-3 rounded-xl border border-amber-200 dark:border-amber-900/80 bg-amber-50/60 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-xs font-bold transition-all"
          >
            Getting There (3)
          </button>
          <button
            onClick={() => handleSetMastery(5)}
            disabled={saving}
            className="py-2.5 px-3 rounded-xl border border-emerald-200 dark:border-emerald-900/80 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mastered (5)</span>
          </button>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <span className="text-xs font-bold text-slate-500">
            {currentIndex + 1} of {cards.length}
          </span>
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-30"
          >
            <span>{currentIndex === cards.length - 1 ? 'Finish Review' : 'Next Card'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FlashcardModal;
