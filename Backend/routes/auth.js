import express from 'express';
import { register, login, getCurrentUser, verifyToken } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-token', verifyToken);

// Protected routes
router.get('/me', protect, getCurrentUser);

export default router;
