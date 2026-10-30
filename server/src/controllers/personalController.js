import { PersonalPlanner } from '../models/PersonalPlanner.js';
import { memoryStore } from '../config/memoryStore.js';
import { getIsMongoConnected } from '../config/db.js';

// @desc    Get user's personal planner (daily tasks, goals, habits)
// @route   GET /api/personal/planner
// @access  Private
export const getPlanner = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    if (getIsMongoConnected()) {
      let planner = await PersonalPlanner.findOne({ userId });
      if (!planner) {
        planner = await PersonalPlanner.create({
          userId,
          dailyTasks: [
            { text: 'Review strategic system design RFC', completed: true, priority: 'high' },
            { text: 'Complete 30-min deep active recall session', completed: false, priority: 'medium' },
            { text: 'Review team pull requests and performance logs', completed: false, priority: 'high' },
          ],
          weeklyGoals: [
            {
              title: 'Ship CollabBoard AI 2.1 Multi-Purpose SaaS Platform',
              targetDate: 'Sunday',
              completed: false,
              subtasks: [
                { text: 'Deploy student learning workspace', done: true },
                { text: 'Implement virtual classrooms & assignments', done: true },
                { text: 'Verify automated regression test suite', done: false },
              ],
            },
          ],
          habits: [
            { name: 'Morning Focus & Deep Work', streak: 12, history: ['2026-10-28', '2026-10-29', '2026-10-30'] },
            { name: 'Daily Algorithmic Problem Solving', streak: 5, history: ['2026-10-29', '2026-10-30'] },
            { name: '10k Steps & Mindfulness', streak: 8, history: ['2026-10-28', '2026-10-29', '2026-10-30'] },
          ],
        });
      }
      return res.json({ success: true, planner });
    } else {
      const planner = memoryStore.getPersonalPlanner(userId);
      return res.json({ success: true, planner });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update daily tasks
// @route   PUT /api/personal/tasks
// @access  Private
export const updateDailyTasks = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { dailyTasks } = req.body;

    if (getIsMongoConnected()) {
      const planner = await PersonalPlanner.findOneAndUpdate(
        { userId },
        { dailyTasks },
        { new: true, upsert: true }
      );
      return res.json({ success: true, planner });
    } else {
      const planner = memoryStore.updatePersonalPlanner(userId, { dailyTasks });
      return res.json({ success: true, planner });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update weekly goals
// @route   PUT /api/personal/goals
// @access  Private
export const updateWeeklyGoals = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { weeklyGoals } = req.body;

    if (getIsMongoConnected()) {
      const planner = await PersonalPlanner.findOneAndUpdate(
        { userId },
        { weeklyGoals },
        { new: true, upsert: true }
      );
      return res.json({ success: true, planner });
    } else {
      const planner = memoryStore.updatePersonalPlanner(userId, { weeklyGoals });
      return res.json({ success: true, planner });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle habit for today
// @route   POST /api/personal/habits/:index/checkin
// @access  Private
export const checkinHabit = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { index } = req.params;
    const idx = parseInt(index, 10);
    const today = new Date().toISOString().split('T')[0];

    const applyCheckin = (planner) => {
      if (planner.habits && planner.habits[idx]) {
        const h = planner.habits[idx];
        const hasToday = (h.history || []).includes(today);
        if (hasToday) {
          h.history = h.history.filter((d) => d !== today);
          h.streak = Math.max(0, h.streak - 1);
        } else {
          h.history = [...(h.history || []), today];
          h.streak += 1;
        }
      }
    };

    if (getIsMongoConnected()) {
      const planner = await PersonalPlanner.findOne({ userId });
      if (!planner) return res.status(404).json({ success: false, message: 'Planner not found' });
      applyCheckin(planner);
      await planner.save();
      return res.json({ success: true, planner });
    } else {
      const planner = memoryStore.getPersonalPlanner(userId);
      applyCheckin(planner);
      memoryStore.updatePersonalPlanner(userId, { habits: planner.habits });
      return res.json({ success: true, planner });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    AI Goal Breakdown into Actionable Subtasks
// @route   POST /api/personal/ai-breakdown
// @access  Private
export const generateAIGoalBreakdown = async (req, res, next) => {
  try {
    const { goalTitle } = req.body;
    const goal = goalTitle || 'Achieve Deep Focus and Peak Daily Productivity';

    return res.json({
      success: true,
      breakdown: {
        title: goal,
        estimatedDuration: '2 Weeks',
        subtasks: [
          { text: `Define objective KPIs and success criteria for ${goal}`, done: false },
          { text: 'Time-block 90-minute uninterrupted focus sprints', done: false },
          { text: 'Eliminate high-distraction notifications and context switching', done: false },
          { text: 'Perform end-of-week retrospective on completed milestones', done: false },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};
