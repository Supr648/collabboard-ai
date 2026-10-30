import api from './client';

export const getPersonalPlanner = async () => {
  const response = await api.get('/personal/planner');
  return response.data;
};

export const updateDailyTasks = async (dailyTasks) => {
  const response = await api.put('/personal/tasks', { dailyTasks });
  return response.data;
};

export const updateWeeklyGoals = async (weeklyGoals) => {
  const response = await api.put('/personal/goals', { weeklyGoals });
  return response.data;
};

export const checkinHabit = async (habitIndex) => {
  const response = await api.post(`/personal/habits/${habitIndex}/checkin`);
  return response.data;
};

export const generateAIGoalBreakdown = async (goalTitle) => {
  const response = await api.post('/personal/ai-breakdown', { goalTitle });
  return response.data;
};
