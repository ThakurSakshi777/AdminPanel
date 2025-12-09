import express from 'express';
import {
  getAllSalaries,
  setSalary,
  updateSalary,
  getPayslip,
  generatePayslips,
  generateAndSendPayslip,
  getAllPayslips,
  getMyPayslips,
  downloadPayslipPDF,
  sendPayslipEmail,
  sendPayslipToDashboard,
  bulkPaymentUpdate,
  exportPayslips,
} from '../controllers/salaryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ===== SALARY ROUTES (specific routes first) =====
router.get('/salary', authorize('hr'), getAllSalaries);
router.post('/salary', authorize('hr'), setSalary);
router.put('/salary/:id', authorize('hr'), updateSalary);

// ===== PAYSLIP ROUTES (specific routes before dynamic :id routes) =====
router.post('/payslip/generate', authorize('hr'), generatePayslips);
router.post('/payslip/generate-and-send', authorize('hr'), generateAndSendPayslip);
router.post('/payslip/bulk-payment', authorize('hr'), bulkPaymentUpdate);
router.get('/payslip', authorize('hr'), getAllPayslips);
router.get('/payslip/export', authorize('hr'), exportPayslips);
router.get('/payslip/my', getMyPayslips);

// ===== PAYSLIP DYNAMIC ROUTES (dynamic :id routes at the end) =====
router.get('/payslip/:id', getPayslip);
router.get('/payslip/:id/download', downloadPayslipPDF);
router.post('/payslip/:id/email', sendPayslipEmail);
router.post('/payslip/:id/send-to-dashboard', authorize('hr'), sendPayslipToDashboard);

export default router;
