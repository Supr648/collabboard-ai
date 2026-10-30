import express from 'express';
import {
  getProjects,
  createProject,
  createPoll,
  votePoll,
  createMeeting,
  generateAIProjectPlan,
  generateAIMeetingSummary,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.post('/ai-plan', generateAIProjectPlan);
router.post('/ai-meeting-summary', generateAIMeetingSummary);

router.post('/:id/polls', createPoll);
router.post('/:id/polls/:pollId/vote', votePoll);
router.post('/:id/meetings', createMeeting);

export default router;
