import express from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByDepartment,
  getEmployeeStats,
  getMyProfile,
  updateMyProfile,
  getMyAttendance,
  getMyLeaves,
  getMySalarySlips,
  getMyPerformance,
  getMySalary,
} from '../controllers/employeeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../config/multerConfig.js';
import {
  uploadEmployeeDocument,
  deleteEmployeeDocument,
} from '../controllers/documentController.js';

const router = express.Router();

// ========== EMPLOYEE DASHBOARD ROUTES ==========
// Get current employee's data
router.get('/me/profile', protect, getMyProfile);
router.put('/me/profile', protect, updateMyProfile);
router.get('/me/attendance', protect, getMyAttendance);
router.get('/me/leaves', protect, getMyLeaves);
router.get('/me/salary/slips', protect, getMySalarySlips);
router.get('/me/performance', protect, getMyPerformance);
router.get('/me/salary', protect, getMySalary);

// ========== HR ROUTES ==========
// Get employee statistics (HR only)
router.get('/stats', protect, authorize('hr'), getEmployeeStats);

// Get employees by department
router.get('/department/:department', protect, getEmployeesByDepartment);

// Get all employees and create new employee
// Anyone can create employees (no HR restriction)
router
  .route('/')
  .get(protect, getAllEmployees)
  .post(protect, createEmployee);

// ========== DOCUMENT MANAGEMENT ROUTES ==========
// Upload/Delete documents for employees
router.post('/:id/documents', protect, upload.single('document'), uploadEmployeeDocument);
router.delete('/:id/documents/:docId', protect, deleteEmployeeDocument);

// Get, update, delete single employee (must be after document routes)
router
  .route('/:id')
  .get(protect, getEmployeeById)
  .put(protect, authorize('hr'), updateEmployee)
  .delete(protect, authorize('hr'), deleteEmployee);

export default router;
