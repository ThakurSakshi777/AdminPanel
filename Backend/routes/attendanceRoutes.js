import express from 'express';
import {
  getAllAttendance,
  checkIn,
  checkOut,
  getMyAttendance,
  getAttendanceStats,
  createAttendance,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Employee routes
router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.post('/', createAttendance);
router.get('/my', getMyAttendance);

// HR/TL only routes
router.get('/', authorize('hr', 'tl'), getAllAttendance);
router.get('/stats', authorize('hr', 'tl'), getAttendanceStats);

export default router;
