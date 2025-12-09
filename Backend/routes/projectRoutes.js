import express from 'express';
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  getMyProjects,
  updateProjectProgress,
} from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Employee routes (must be before /:id routes)
router.get('/my', getMyProjects);
router.put('/:id/progress', updateProjectProgress);

// All authenticated users can view projects
router.get('/', getAllProjects);

// Authenticated users can create projects
router.post('/', createProject);

// HR/TL can update and delete projects
router.put('/:id', authorize('hr', 'tl'), updateProject);
router.delete('/:id', authorize('hr'), deleteProject);

export default router;
