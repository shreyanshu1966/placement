import express from 'express';
import {
  checkOllamaStatus,
  generateQuestions,
  generateForWeakTopics,
  enhanceQuestion,
  getStudentInsights,
  chatWithAI,
  pullModel
} from '../controllers/aiController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// AI service status
router.get('/status', authorize('faculty', 'admin'), checkOllamaStatus);

// Question generation
router.post('/generate-questions', authorize('faculty', 'admin'), generateQuestions);
router.post('/generate-for-weak-topics', authorize('faculty', 'admin'), generateForWeakTopics);
router.post('/enhance-question/:id', authorize('faculty', 'admin'), enhanceQuestion);

// Student insights
router.get('/insights/:studentId', getStudentInsights);

// AI chat assistant
router.post('/chat', chatWithAI);

// Model management
router.post('/pull-model', authorize('admin'), pullModel);

export default router;
