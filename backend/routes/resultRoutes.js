import express from 'express';
import {
  getResults,
  getResultById,
  getMyResults,
  reviewAnswer,
  generatePerformanceReport
} from '../controllers/resultController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/my-results', getMyResults);
router.get('/:id/report', generatePerformanceReport);
router.put('/:id/review', authorize('faculty', 'admin'), reviewAnswer);

router.route('/')
  .get(authorize('faculty', 'admin'), getResults);

router.route('/:id')
  .get(getResultById);

export default router;
