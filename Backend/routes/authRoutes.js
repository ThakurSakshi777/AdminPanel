import express from 'express';
import {
  signup,
  login,
  getMe,
  logout,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

export default router;
