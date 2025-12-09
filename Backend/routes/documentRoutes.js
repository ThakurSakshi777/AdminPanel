import express from 'express';
import {
  uploadDocument,
  getAllDocuments,
  getMyDocuments,
  approveDocument,
  rejectDocument,
  deleteDocument,
  downloadDocument,
} from '../controllers/documentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Employee routes
router.post('/upload', upload.single('document'), uploadDocument);
router.get('/my', getMyDocuments);

// HR and Employee routes - GET all documents (with filters)
router.get('/', getAllDocuments);

// Download document
router.get('/:id/download', downloadDocument);

// HR only routes
router.put('/:id/approve', authorize('hr'), approveDocument);
router.put('/:id/reject', authorize('hr'), rejectDocument);
router.delete('/:id', authorize('hr'), deleteDocument);

export default router;
