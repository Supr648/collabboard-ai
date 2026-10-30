import client from './client';

// Fetch all tasks for a specific whiteboard
export const getBoardTasks = async (boardId) => {
  const res = await client.get(`/tasks?boardId=${boardId}`);
  return res.data;
};

// Create a new task
export const createTask = async (taskData) => {
  const res = await client.post('/tasks', taskData);
  return res.data;
};

// Update task (status, priority, description, etc.)
export const updateTask = async (taskId, updates) => {
  const res = await client.put(`/tasks/${taskId}`, updates);
  return res.data;
};

// Delete a task
export const deleteTask = async (taskId) => {
  const res = await client.delete(`/tasks/${taskId}`);
  return res.data;
};
