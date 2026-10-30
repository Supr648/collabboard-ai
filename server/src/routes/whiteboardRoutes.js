import express from 'express';
import {
  createWhiteboard,
  getWhiteboards,
  getWhiteboardByRoomId,
  updateWhiteboard,
  saveWhiteboardState,
  deleteWhiteboard,
  duplicateWhiteboard,
  createVersionSnapshot,
  getVersionHistory,
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
router.put('/room/:roomId', optionalAuth, saveWhiteboardState);
router.post('/:id/versions', optionalAuth, createVersionSnapshot);
router.get('/:id/versions', optionalAuth, getVersionHistory);
router.post('/room/:roomId/versions', optionalAuth, createVersionSnapshot);
router.get('/room/:roomId/versions', optionalAuth, getVersionHistory);
router.delete('/:id', protect, deleteWhiteboard);

export default router;

