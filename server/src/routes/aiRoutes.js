import express from 'express';
import {
  generateDiagram,
  generateFlowchart,
  generateBrainstorming,
  summarizeBoard,
  explainDiagram,
} from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/diagram', optionalAuth, generateDiagram);
router.post('/flowchart', optionalAuth, generateFlowchart);
router.post('/brainstorm', optionalAuth, generateBrainstorming);
router.post('/summarize', optionalAuth, summarizeBoard);
router.post('/explain', optionalAuth, explainDiagram);

export default router;
