import express from 'express';
import {
  generateDiagram,
  generateFlowchart,
  generateBrainstorming,
  summarizeBoard,
  explainDiagram,
  generateMindMap,
  executeCanvasCommand,
  extractDocumentIntelligence,
  critiqueBoard,
} from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/diagram', optionalAuth, generateDiagram);
router.post('/generate-diagram', optionalAuth, generateDiagram);
router.post('/flowchart', optionalAuth, generateFlowchart);
router.post('/generate-flowchart', optionalAuth, generateFlowchart);
router.post('/brainstorm', optionalAuth, generateBrainstorming);
router.post('/generate-brainstorm', optionalAuth, generateBrainstorming);
router.post('/summarize', optionalAuth, summarizeBoard);
router.post('/explain', optionalAuth, explainDiagram);
router.post('/mindmap', optionalAuth, generateMindMap);
router.post('/generate-mindmap', optionalAuth, generateMindMap);
router.post('/command', optionalAuth, executeCanvasCommand);
router.post('/document-intelligence', optionalAuth, extractDocumentIntelligence);
router.post('/critique', optionalAuth, critiqueBoard);

export default router;

