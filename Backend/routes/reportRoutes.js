import express from 'express';
import {
  getAttendanceReport,
  getPerformanceReport,
  getLeaveReport,
  getEmployeeReport,
  getProjectReport,
  getPayrollReport,
  exportReportPDF,
  getRecentReports,
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/reports/recent
// @desc    Get recent reports
// @access  Private (HR, TL)
router.get('/recent', authorize('hr', 'tl'), getRecentReports);

// @route   GET /api/reports/attendance
// @desc    Get attendance report with filters
// @access  Private (HR, TL)
// Query params: dateFrom, dateTo, department, employeeId
router.get('/attendance', authorize('hr', 'tl'), getAttendanceReport);

// @route   GET /api/reports/performance
// @desc    Get performance report based on tasks
// @access  Private (HR, TL)
// Query params: dateFrom, dateTo, department, employeeId
router.get('/performance', authorize('hr', 'tl'), getPerformanceReport);

// @route   GET /api/reports/leave
// @desc    Get leave report with filters
// @access  Private (HR, TL)
// Query params: dateFrom, dateTo, department, employeeId, status
router.get('/leave', authorize('hr', 'tl'), getLeaveReport);

// @route   GET /api/reports/employee
// @desc    Get employee report with filters
// @access  Private (HR, TL)
// Query params: department, employeeId, status
router.get('/employee', authorize('hr', 'tl'), getEmployeeReport);

// @route   GET /api/reports/project
// @desc    Get project report with filters
// @access  Private (HR, TL)
// Query params: dateFrom, dateTo, status, department
router.get('/project', authorize('hr', 'tl'), getProjectReport);

// @route   GET /api/reports/payroll
// @desc    Get payroll report with filters
// @access  Private (HR)
// Query params: month, year, department, employeeId
router.get('/payroll', authorize('hr'), getPayrollReport);

// @route   GET /api/reports/:reportId/export
// @desc    Export report as PDF
// @access  Private (HR, TL)
// Dynamic routes should come LAST to avoid matching specific routes
router.get('/:reportId/export', authorize('hr', 'tl'), exportReportPDF);

export default router;
