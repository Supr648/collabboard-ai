import { Task } from '../models/Task.js';
import { memoryStore } from '../config/memoryStore.js';
import { getIsMongoConnected } from '../config/db.js';

// @desc    Get tasks for a specific board
// @route   GET /api/tasks?boardId=:boardId
// @access  Public / Optional Auth
export const getTasks = async (req, res, next) => {
  try {
    const { boardId } = req.query;
    if (!boardId) {
      return res.status(400).json({ success: false, message: 'boardId query parameter is required' });
    }

    if (getIsMongoConnected()) {
      const tasks = await Task.find({ boardId }).sort({ createdAt: -1 });
      return res.json({ success: true, count: tasks.length, tasks, data: tasks });
    } else {
      const tasks = memoryStore.findTasksByBoardId(boardId);
      return res.json({ success: true, count: tasks.length, tasks, data: tasks });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task (e.g. from scratch or converted from sticky note)
// @route   POST /api/tasks
// @access  Public / Optional Auth
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, boardId, originElementId, assignedTo } = req.body;

    if (!title || !title.trim() || !boardId) {
      return res.status(400).json({ success: false, message: 'Title and boardId are required' });
    }

    const taskData = {
      title: title.trim(),
      description: (description || '').trim(),
      status: ['backlog', 'in_progress', 'in_review', 'done'].includes(status) ? status : 'backlog',
      priority: ['low', 'medium', 'high', 'urgent'].includes(priority) ? priority : 'medium',
      dueDate: dueDate || '',
      boardId,
      originElementId: originElementId || '',
      assignedTo: assignedTo || 'Unassigned',
      createdBy: req.user?.name || 'Collaborator',
    };

    if (getIsMongoConnected()) {
      const task = await Task.create(taskData);
      return res.status(201).json({ success: true, task, data: task });
    } else {
      const task = memoryStore.createTask(taskData);
      return res.status(201).json({ success: true, task, data: task });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status, priority, description, etc.
// @route   PUT /api/tasks/:id
// @access  Public / Optional Auth
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (getIsMongoConnected()) {
      const task = await Task.findByIdAndUpdate(id, updates, { new: true });
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      return res.json({ success: true, task, data: task });
    } else {
      const task = memoryStore.updateTask(id, updates);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      return res.json({ success: true, task, data: task });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Public / Optional Auth
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getIsMongoConnected()) {
      await Task.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Task deleted successfully' });
    } else {
      memoryStore.deleteTask(id);
      return res.json({ success: true, message: 'Task deleted successfully' });
    }
  } catch (error) {
    next(error);
  }
};
