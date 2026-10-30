import express from 'express';
import {
  getClassrooms,
  createClassroom,
  createAssignment,
  submitStudentAssignment,
  generateAITeachingMaterial,
} from '../controllers/teacherController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/classrooms')
  .get(getClassrooms)
  .post(createClassroom);

router.post('/classrooms/:id/assignments', createAssignment);
router.post('/classrooms/:id/assignments/:assignmentId/submit', submitStudentAssignment);
router.post('/ai-lesson-material', generateAITeachingMaterial);

export default router;
