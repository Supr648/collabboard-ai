import express from 'express';
import {
  getStudentSummary,
  getStudyDecks,
  createStudyDeck,
  updateCardMastery,
  submitQuizAttempt,
  generateAIQuiz,
  generateAIFlashcards,
} from '../controllers/studentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getStudentSummary);
router.get('/decks', getStudyDecks);
router.post('/decks', createStudyDeck);
router.put('/decks/:deckId/cards/:cardIndex/mastery', updateCardMastery);
router.post('/decks/:id/attempt', submitQuizAttempt);
router.post('/ai-quiz', generateAIQuiz);
router.post('/ai-flashcards', generateAIFlashcards);

export default router;
