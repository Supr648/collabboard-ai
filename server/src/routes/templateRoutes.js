import express from 'express';
import {
  getCommunityTemplates,
  publishCommunityTemplate,
  cloneCommunityTemplate,
  reportCommunityTemplate,
} from '../controllers/templateController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/community', optionalAuth, getCommunityTemplates);
router.post('/community/publish', protect, publishCommunityTemplate);
router.post('/community/:id/clone', optionalAuth, cloneCommunityTemplate);
router.post('/community/:id/report', protect, reportCommunityTemplate);

export default router;
