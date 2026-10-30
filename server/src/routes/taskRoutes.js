import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getTasks);
router.post('/', optionalAuth, createTask);
router.put('/:id', optionalAuth, updateTask);
router.delete('/:id', optionalAuth, deleteTask);

export default router;
