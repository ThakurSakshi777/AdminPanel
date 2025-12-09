import express from 'express';
import {
  getAllLeaves,
  applyLeave,
  getMyLeaves,
  approveLeave,
  rejectLeave,
} from '../controllers/leaveController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// HR/TL only routes (must come before generic routes)
router.get('/', authorize('hr', 'tl'), getAllLeaves);
router.put('/:id/approve', authorize('hr', 'tl'), approveLeave);
router.put('/:id/reject', authorize('hr', 'tl'), rejectLeave);

// Employee routes
router.post('/', applyLeave);
router.get('/my', getMyLeaves);

export default router;
