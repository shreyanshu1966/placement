import express from 'express';
import {
  getStudentAnalytics,
  getCourseAnalytics,
  getBatchAnalytics,
  getDashboardAnalytics,
  getAssessmentAnalytics
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/student/:id', getStudentAnalytics);
router.get('/course/:id', authorize('faculty', 'admin'), getCourseAnalytics);
router.get('/batch/:batch', authorize('faculty', 'admin'), getBatchAnalytics);
router.get('/assessment/:id', authorize('faculty', 'admin'), getAssessmentAnalytics);

export default router;
