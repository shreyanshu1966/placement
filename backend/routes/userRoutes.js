import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserContext,
  updateUserContext
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin only routes
router.get('/', authorize('admin'), getUsers);
router.put('/:id', authorize('admin', 'faculty'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

// Available to all authenticated users
router.get('/profile', (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

router.get('/progress', async (req, res) => {
  res.status(200).json({
    success: true,
    progress: {
      completedAssessments: 0,
      totalCourses: 0,
      averageScore: 0,
      skillLevels: {},
      recentActivity: []
    }
  });
});

router.get('/:id', getUserById);
router.get('/:id/context', getUserContext);
router.put('/:id/context', authorize('admin', 'faculty'), updateUserContext);

export default router;
