import express from 'express';
import {
  getAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  generateAdaptiveAssessment,
  startAssessment,
  submitAssessment
} from '../controllers/assessmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getAssessments)
  .post(authorize('faculty', 'admin'), createAssessment);

router.post('/generate', generateAdaptiveAssessment);
router.post('/:id/start', startAssessment);
router.post('/:id/submit', submitAssessment);

router.route('/:id')
  .get(getAssessmentById)
  .put(authorize('faculty', 'admin'), updateAssessment)
  .delete(authorize('faculty', 'admin'), deleteAssessment);

export default router;
