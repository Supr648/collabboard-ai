import express from 'express';
import {
  createWhiteboard,
  getWhiteboards,
  getWhiteboardByRoomId,
  updateWhiteboard,
  saveWhiteboardState,
  deleteWhiteboard,
  duplicateWhiteboard,
} from '../controllers/whiteboardController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createWhiteboard);
router.get('/', protect, getWhiteboards);
router.get('/room/:roomId', optionalAuth, getWhiteboardByRoomId);
router.get('/:roomId', optionalAuth, getWhiteboardByRoomId);
router.post('/:id/duplicate', protect, duplicateWhiteboard);
router.put('/:id', protect, updateWhiteboard);
router.put('/room/:roomId/save', optionalAuth, saveWhiteboardState);
router.delete('/:id', protect, deleteWhiteboard);

export default router;

