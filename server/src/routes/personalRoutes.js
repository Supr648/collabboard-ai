import express from 'express';
import {
  getPlanner,
  updateDailyTasks,
  updateWeeklyGoals,
  checkinHabit,
  generateAIGoalBreakdown,
} from '../controllers/personalController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/planner', getPlanner);
router.put('/tasks', updateDailyTasks);
router.put('/goals', updateWeeklyGoals);
router.post('/habits/:index/checkin', checkinHabit);
router.post('/ai-breakdown', generateAIGoalBreakdown);

export default router;
