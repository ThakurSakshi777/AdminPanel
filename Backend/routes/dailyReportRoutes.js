import express from 'express';
import {
  getMyReports,
  createReport,
  updateReport,
  deleteReport,
} from '../controllers/dailyReportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected (require authentication)
router.get('/my', protect, getMyReports);
router.post('/', protect, createReport);
router.put('/:id', protect, updateReport);
router.delete('/:id', protect, deleteReport);

export default router;
