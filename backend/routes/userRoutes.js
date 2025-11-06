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
router.get('/:id', getUserById);
router.get('/:id/context', getUserContext);
router.put('/:id/context', authorize('admin', 'faculty'), updateUserContext);

export default router;
