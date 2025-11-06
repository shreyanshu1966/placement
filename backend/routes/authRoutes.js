import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  forgotPassword,
  updateProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes (with strict rate limiting)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/password', protect, updatePassword);
router.put('/profile', protect, updateProfile);

export default router;
