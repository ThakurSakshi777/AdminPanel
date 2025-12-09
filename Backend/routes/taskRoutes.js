import express from 'express';
import {
  getAllTasks,
  createTask,
  getMyTasks,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Employee routes
router.get('/my', getMyTasks);

// All authenticated users can update task
router.put('/:id', updateTask);

// HR/TL only routes
router.get('/', authorize('hr', 'tl'), getAllTasks);
router.post('/', authorize('hr', 'tl'), createTask);
router.delete('/:id', authorize('hr', 'tl'), deleteTask);

export default router;
