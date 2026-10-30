import mongoose from 'mongoose';

const studyDeckSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      default: 'General',
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['flashcards', 'quiz', 'notes', 'schedule'],
      default: 'flashcards',
    },
    cards: [
      {
        front: { type: String, required: true },
        back: { type: String, required: true },
        masteryScore: { type: Number, default: 0 }, // 0 to 5
        lastReviewed: { type: Date, default: Date.now },
      },
    ],
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctIndex: { type: Number, required: true },
        explanation: { type: String, default: '' },
      },
    ],
    quizAttempts: [
      {
        score: Number,
        total: Number,
        weakTopics: [String],
        attemptedAt: { type: Date, default: Date.now },
      },
    ],
    revisionSchedule: [
      {
        topic: String,
        dueDate: String,
        priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const StudyDeck = mongoose.models.StudyDeck || mongoose.model('StudyDeck', studyDeckSchema);
