import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes with auth middleware
router.use(protect);

// Get all notifications for current user
router.get('/', getNotifications);

// Get unread notifications count
router.get('/unread/count', getUnreadCount);

// Mark specific notification as read
router.put('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.put('/mark-all-as-read', markAllAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

export default router;
