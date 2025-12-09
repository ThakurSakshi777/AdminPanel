import express from 'express';
import {
  getAllAnnouncements,
  getPublishedAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement
} from '../controllers/announcementController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (no auth needed)
router.get('/published', getPublishedAnnouncements);

// All other routes require authentication
router.use(protect);

// HR only - POST, update, delete, publish
router.post('/', authorize('hr'), createAnnouncement);
router.put('/:id/publish', authorize('hr'), publishAnnouncement);
router.put('/:id', authorize('hr'), updateAnnouncement);
router.delete('/:id', authorize('hr'), deleteAnnouncement);

// GET all announcements - accessible to all authenticated users
// HR sees all, employees see only published
router.get('/', getAllAnnouncements);

// GET single announcement - accessible to all authenticated users
router.get('/:id', getAnnouncement);

export default router;
