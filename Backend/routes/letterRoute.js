import express from 'express';
import {
  generateLetter,
  getAllLetters,
  getEmployeeLetters,
  downloadLetter,
  sendLetter,
  viewLetter,
  deleteLetter,
} from '../controllers/letterController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All letter routes require authentication
router.use(protect);

// Generate new letter (HR only)
router.post('/generate', generateLetter);

// Get all letters (HR)
router.get('/', getAllLetters);

// Get letters for current employee
router.get('/my-letters', getEmployeeLetters);

// Download letter as PDF
router.get('/:id/download', downloadLetter);

// Send letter via email
router.post('/:id/send', sendLetter);

// Mark letter as viewed
router.put('/:id/view', viewLetter);

// Delete letter (HR only)
router.delete('/:id', deleteLetter);

export default router;
