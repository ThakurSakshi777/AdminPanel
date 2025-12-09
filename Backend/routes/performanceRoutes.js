import express from 'express';
import {
  getAllPerformance,
  getEmployeePerformance,
  updateEmployeeRating,
  getPerformanceStats,
  getDepartmentPerformance,
  getEmployeeGoals,
  addEmployeeGoal,
  updateGoalProgress,
  getMyPerformance,
} from '../controllers/performanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/performance/my
// @desc    Get my performance data (logged-in employee)
// @access  Private (Employee, HR, TL)
router.get('/my', getMyPerformance);

// @route   GET /api/performance/stats
// @desc    Get performance statistics
// @access  Private (HR, TL)
// Query params: month, year
router.get('/stats', authorize('hr', 'tl'), getPerformanceStats);

// @route   GET /api/performance/department/:dept
// @desc    Get department-wise performance
// @access  Private (HR, TL)
// Query params: month, year
router.get('/department/:dept', authorize('hr', 'tl'), getDepartmentPerformance);

// @route   PUT /api/performance/goals/:goalId
// @desc    Update goal progress
// @access  Private (HR, TL, Employee - own goals)
// Body: { progress, status, notes, milestones, completedDate }
router.put('/goals/:goalId', updateGoalProgress);

// @route   GET /api/performance
// @desc    Get all employee performance data
// @access  Private (HR, TL)
// Query params: department, month, year
router.get('/', authorize('hr', 'tl'), getAllPerformance);

// @route   GET /api/performance/:employeeId/goals
// @desc    Get employee goals
// @access  Private (HR, TL, Employee - own goals)
// Query params: status, isActive
router.get('/:employeeId/goals', getEmployeeGoals);

// @route   POST /api/performance/:employeeId/goals
// @desc    Add new goal for employee
// @access  Private (HR, TL)
// Body: { title, description, category, priority, targetDate, startDate, milestones, performanceImpact, skillsToImprove }
router.post('/:employeeId/goals', authorize('hr', 'tl'), addEmployeeGoal);

// @route   GET /api/performance/:employeeId
// @desc    Get individual employee performance details
// @access  Private (HR, TL, Employee - own data)
// Query params: month, year
router.get('/:employeeId', getEmployeePerformance);

// @route   PUT /api/performance/:employeeId/rating
// @desc    Update employee rating and performance
// @access  Private (HR, TL)
// Body: { rating, overallScore, feedback, strengths, areasForImprovement, achievements, skills }
router.put('/:employeeId/rating', authorize('hr', 'tl'), updateEmployeeRating);

export default router;
