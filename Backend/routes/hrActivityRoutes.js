import express from 'express';
import {
  trackHRLogin,
  trackHRSignup,
  trackHRLogout,
  getHRActivityHistory,
  getAllHRActivities,
  getTodayHRActivities,
} from '../controllers/hrActivityController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (called from login/signup endpoints)
router.post('/track-login', trackHRLogin);
router.post('/track-signup', trackHRSignup);

// Private routes
router.post('/track-logout', protect, trackHRLogout);
router.get('/history/:hrId', protect, getHRActivityHistory);
router.get('/today', protect, authorize('admin'), getTodayHRActivities);
router.get('/all', protect, authorize('admin'), getAllHRActivities);

export default router;
