import express from 'express';
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkImportQuestions
} from '../controllers/questionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .get(getQuestions)
  .post(authorize('faculty', 'admin'), createQuestion);

router.post('/bulk', authorize('faculty', 'admin'), bulkImportQuestions);

router.route('/:id')
  .get(getQuestionById)
  .put(authorize('faculty', 'admin'), updateQuestion)
  .delete(authorize('faculty', 'admin'), deleteQuestion);

export default router;
