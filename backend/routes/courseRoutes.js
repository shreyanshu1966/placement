import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  updateProgress
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getCourses)
  .post(authorize('faculty', 'admin'), createCourse);

router.route('/:id')
  .get(getCourseById)
  .put(authorize('faculty', 'admin'), updateCourse)
  .delete(authorize('admin'), deleteCourse);

router.post('/:id/enroll', authorize('student', 'admin'), enrollStudent);
router.put('/:id/progress', authorize('student', 'faculty', 'admin'), updateProgress);

export default router;
