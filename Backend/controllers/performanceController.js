import Performance from '../models/Performance.js';
import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import Attendance from '../models/Attendance.js';
import Project from '../models/Project.js';
import Goal from '../models/Goal.js';

// @desc    Get all employee performance data
// @route   GET /api/performance
// @access  Private (HR, TL)
export const getAllPerformance = async (req, res) => {
  try {
    const { department, month, year } = req.query;
    console.log('📊 GET /api/performance - Fetching all performance data...');

    // Build filter for employees
    const employeeFilter = {};
    if (department) {
      employeeFilter.department = department;
    }

    // Get employees
    const employees = await Employee.find(employeeFilter).populate('userId', 'firstName lastName email');

    // Get current period if not specified
    const currentDate = new Date();
    const filterMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const filterYear = year ? parseInt(year) : currentDate.getFullYear();

    // Fetch performance data for all employees
    const performanceData = await Promise.all(
      employees.map(async (employee) => {
        try {
          // Get or create performance record
          let performance = await Performance.findOne({
            employeeId: employee.employeeId,
            'reviewPeriod.month': filterMonth,
            'reviewPeriod.year': filterYear,
          }).populate('reviewedBy', 'firstName lastName');

          // If no performance record exists, calculate from scratch
          if (!performance) {
            // Calculate task metrics
            const tasks = await Task.find({
              assignedTo: employee.employeeId,
              createdAt: {
                $gte: new Date(filterYear, filterMonth - 1, 1),
                $lt: new Date(filterYear, filterMonth, 1),
              },
            });

            const tasksCompleted = tasks.filter(t => t.status === 'Completed').length;
            const tasksAssigned = tasks.length;
            const taskCompletionRate = tasksAssigned > 0 ? Math.round((tasksCompleted / tasksAssigned) * 100) : 0;

            // Calculate attendance metrics
            const attendanceRecords = await Attendance.find({
              employeeId: employee.employeeId,
              date: {
                $gte: new Date(filterYear, filterMonth - 1, 1),
                $lt: new Date(filterYear, filterMonth, 1),
              },
            });

            const totalWorkingDays = attendanceRecords.length;
            const presentDays = attendanceRecords.filter(a => a.status === 'Present').length;
            const attendanceRate = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0;

            // Calculate project metrics
            const projects = await Project.find({
              $or: [
                { 'teamMembers.employeeId': employee.employeeId },
                { teamLeader: employee.employeeId },
              ],
            });

            const activeProjects = projects.filter(p => p.status === 'In Progress').length;
            const completedProjects = projects.filter(p => p.status === 'Completed').length;

            // Calculate overall score (weighted average)
            const overallScore = Math.round(
              (taskCompletionRate * 0.4) + (attendanceRate * 0.3) + (activeProjects * 5) + (completedProjects * 3)
            );

            // Create performance record
            performance = await Performance.create({
              employeeId: employee.employeeId,
              userId: employee.userId._id,
              overallScore: Math.min(overallScore, 100),
              tasksCompleted,
              tasksAssigned,
              taskCompletionRate,
              attendanceRate: `${attendanceRate}%`,
              totalWorkingDays,
              presentDays,
              activeProjects,
              completedProjects,
              reviewPeriod: {
                month: filterMonth,
                year: filterYear,
              },
            });
          }

          return {
            id: employee._id,
            employeeId: employee.employeeId,
            name: employee.userId ? `${employee.userId.firstName} ${employee.userId.lastName}` : 'N/A',
            role: employee.position,
            department: employee.department,
            joinDate: employee.joiningDate,
            tasksCompleted: performance.tasksCompleted,
            attendance: performance.attendanceRate,
            rating: performance.rating,
            performance: performance.overallScore,
            projects: performance.activeProjects,
            overtimeHours: performance.overtimeHours,
            trend: performance.trend,
            achievements: performance.achievements,
            skills: performance.skills,
            taskCompletionRate: performance.taskCompletionRate,
          };
        } catch (error) {
          console.error(`Error calculating performance for ${employee.employeeId}:`, error);
          return null;
        }
      })
    );

    // Filter out null values
    const validPerformanceData = performanceData.filter(p => p !== null);

    console.log(`✅ Fetched performance data for ${validPerformanceData.length} employees`);

    res.status(200).json({
      success: true,
      count: validPerformanceData.length,
      data: validPerformanceData,
    });
  } catch (error) {
    console.error('❌ Get All Performance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching performance data',
      error: error.message,
    });
  }
};

// @desc    Get individual employee performance details
// @route   GET /api/performance/:employeeId
// @access  Private (HR, TL, Employee - own data)
export const getEmployeePerformance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    console.log(`📊 GET /api/performance/${employeeId} - Fetching performance details...`);

    // Get employee
    const employee = await Employee.findOne({ employeeId }).populate('userId', 'firstName lastName email');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Get current period if not specified
    const currentDate = new Date();
    const filterMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const filterYear = year ? parseInt(year) : currentDate.getFullYear();

    // Get performance record
    let performance = await Performance.findOne({
      employeeId,
      'reviewPeriod.month': filterMonth,
      'reviewPeriod.year': filterYear,
    }).populate('reviewedBy', 'firstName lastName');

    // If not found, calculate and create
    if (!performance) {
      // Calculate metrics
      const tasks = await Task.find({
        assignedTo: employeeId,
        createdAt: {
          $gte: new Date(filterYear, filterMonth - 1, 1),
          $lt: new Date(filterYear, filterMonth, 1),
        },
      });

      const tasksCompleted = tasks.filter(t => t.status === 'Completed').length;
      const tasksAssigned = tasks.length;
      const taskCompletionRate = tasksAssigned > 0 ? Math.round((tasksCompleted / tasksAssigned) * 100) : 0;

      const attendanceRecords = await Attendance.find({
        employeeId,
        date: {
          $gte: new Date(filterYear, filterMonth - 1, 1),
          $lt: new Date(filterYear, filterMonth, 1),
        },
      });

      const totalWorkingDays = attendanceRecords.length;
      const presentDays = attendanceRecords.filter(a => a.status === 'Present').length;
      const attendanceRate = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0;
      const overtimeHours = attendanceRecords.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

      const projects = await Project.find({
        $or: [
          { 'teamMembers.employeeId': employeeId },
          { teamLeader: employeeId },
        ],
      });

      const activeProjects = projects.filter(p => p.status === 'In Progress').length;
      const completedProjects = projects.filter(p => p.status === 'Completed').length;

      const overallScore = Math.round(
        (taskCompletionRate * 0.4) + (attendanceRate * 0.3) + (activeProjects * 5) + (completedProjects * 3)
      );

      performance = await Performance.create({
        employeeId,
        userId: employee.userId._id,
        overallScore: Math.min(overallScore, 100),
        tasksCompleted,
        tasksAssigned,
        taskCompletionRate,
        attendanceRate: `${attendanceRate}%`,
        totalWorkingDays,
        presentDays,
        activeProjects,
        completedProjects,
        overtimeHours,
        reviewPeriod: {
          month: filterMonth,
          year: filterYear,
        },
      });
    }

    // Detailed response
    const detailedPerformance = {
      employeeId: employee.employeeId,
      name: employee.userId ? `${employee.userId.firstName} ${employee.userId.lastName}` : 'N/A',
      email: employee.userId?.email,
      role: employee.position,
      department: employee.department,
      joinDate: employee.joiningDate,
      performance: {
        overallScore: performance.overallScore,
        rating: performance.rating,
        trend: performance.trend,
        previousScore: performance.previousScore,
      },
      tasks: {
        completed: performance.tasksCompleted,
        assigned: performance.tasksAssigned,
        completionRate: performance.taskCompletionRate,
      },
      attendance: {
        rate: performance.attendanceRate,
        totalDays: performance.totalWorkingDays,
        presentDays: performance.presentDays,
      },
      projects: {
        active: performance.activeProjects,
        completed: performance.completedProjects,
      },
      overtimeHours: performance.overtimeHours,
      achievements: performance.achievements,
      skills: performance.skills,
      feedback: performance.feedback,
      strengths: performance.strengths,
      areasForImprovement: performance.areasForImprovement,
      reviewInfo: {
        reviewedBy: performance.reviewedBy ? `${performance.reviewedBy.firstName} ${performance.reviewedBy.lastName}` : null,
        reviewDate: performance.reviewDate,
        nextReviewDate: performance.nextReviewDate,
      },
      reviewPeriod: performance.reviewPeriod,
    };

    console.log(`✅ Fetched detailed performance for ${employeeId}`);

    res.status(200).json({
      success: true,
      data: detailedPerformance,
    });
  } catch (error) {
    console.error('❌ Get Employee Performance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee performance',
      error: error.message,
    });
  }
};

// @desc    Update employee rating and performance
// @route   PUT /api/performance/:employeeId/rating
// @access  Private (HR, TL)
export const updateEmployeeRating = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { rating, overallScore, feedback, strengths, areasForImprovement, achievements, skills, month, year } = req.body;

    console.log(`📝 PUT /api/performance/${employeeId}/rating - Updating rating...`);

    // Validate employee
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Get current period
    const currentDate = new Date();
    const reviewMonth = month || currentDate.getMonth() + 1;
    const reviewYear = year || currentDate.getFullYear();

    // Find or create performance record
    let performance = await Performance.findOne({
      employeeId,
      'reviewPeriod.month': reviewMonth,
      'reviewPeriod.year': reviewYear,
    });

    if (!performance) {
      performance = new Performance({
        employeeId,
        userId: employee.userId,
        reviewPeriod: {
          month: reviewMonth,
          year: reviewYear,
        },
      });
    }

    // Store previous score for trend calculation
    if (overallScore && performance.overallScore !== overallScore) {
      performance.previousScore = performance.overallScore;
    }

    // Update fields
    if (rating !== undefined) performance.rating = rating;
    if (overallScore !== undefined) performance.overallScore = overallScore;
    if (feedback) performance.feedback = feedback;
    if (strengths) performance.strengths = strengths;
    if (areasForImprovement) performance.areasForImprovement = areasForImprovement;
    if (achievements) performance.achievements = achievements;
    if (skills) performance.skills = skills;

    performance.reviewedBy = req.user._id;
    performance.reviewDate = new Date();
    performance.nextReviewDate = new Date(currentDate.setMonth(currentDate.getMonth() + 3)); // Next review in 3 months

    await performance.save();

    console.log(`✅ Updated rating for ${employeeId}`);

    res.status(200).json({
      success: true,
      message: 'Employee rating updated successfully',
      data: performance,
    });
  } catch (error) {
    console.error('❌ Update Employee Rating Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employee rating',
      error: error.message,
    });
  }
};

// @desc    Get performance statistics
// @route   GET /api/performance/stats
// @access  Private (HR, TL)
export const getPerformanceStats = async (req, res) => {
  try {
    const { month, year } = req.query;

    console.log('📊 GET /api/performance/stats - Calculating statistics...');

    // Get current period
    const currentDate = new Date();
    const filterMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const filterYear = year ? parseInt(year) : currentDate.getFullYear();

    // Get all performance records for the period
    const performances = await Performance.find({
      'reviewPeriod.month': filterMonth,
      'reviewPeriod.year': filterYear,
    }).populate('userId', 'firstName lastName');

    // Calculate statistics
    const totalEmployees = performances.length;
    const topPerformers = performances.filter(p => p.overallScore >= 90).length;
    const goodPerformers = performances.filter(p => p.overallScore >= 75 && p.overallScore < 90).length;
    const needsImprovement = performances.filter(p => p.overallScore < 75).length;

    const avgScore = totalEmployees > 0 
      ? (performances.reduce((sum, p) => sum + p.overallScore, 0) / totalEmployees).toFixed(1) 
      : 0;

    const avgRating = totalEmployees > 0 
      ? (performances.reduce((sum, p) => sum + p.rating, 0) / totalEmployees).toFixed(1) 
      : 0;

    const totalTasksCompleted = performances.reduce((sum, p) => sum + p.tasksCompleted, 0);
    const totalTasksAssigned = performances.reduce((sum, p) => sum + p.tasksAssigned, 0);
    const avgTaskCompletion = totalTasksAssigned > 0 
      ? Math.round((totalTasksCompleted / totalTasksAssigned) * 100) 
      : 0;

    const totalActiveProjects = performances.reduce((sum, p) => sum + p.activeProjects, 0);
    const totalCompletedProjects = performances.reduce((sum, p) => sum + p.completedProjects, 0);

    // Top 5 performers
    const topPerformersList = performances
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 5)
      .map(p => ({
        employeeId: p.employeeId,
        name: p.userId ? `${p.userId.firstName} ${p.userId.lastName}` : 'N/A',
        score: p.overallScore,
        rating: p.rating,
      }));

    // Calculate growth trend
    const previousMonth = filterMonth === 1 ? 12 : filterMonth - 1;
    const previousYear = filterMonth === 1 ? filterYear - 1 : filterYear;

    const previousPerformances = await Performance.find({
      'reviewPeriod.month': previousMonth,
      'reviewPeriod.year': previousYear,
    });

    const previousAvgScore = previousPerformances.length > 0
      ? previousPerformances.reduce((sum, p) => sum + p.overallScore, 0) / previousPerformances.length
      : avgScore;

    const growthTrend = previousAvgScore > 0
      ? ((avgScore - previousAvgScore) / previousAvgScore * 100).toFixed(1)
      : 0;

    const stats = {
      totalEmployees,
      topPerformers,
      goodPerformers,
      needsImprovement,
      avgScore: parseFloat(avgScore),
      avgRating: parseFloat(avgRating),
      avgTaskCompletion,
      totalActiveProjects,
      totalCompletedProjects,
      growthTrend: `${growthTrend > 0 ? '+' : ''}${growthTrend}%`,
      topPerformersList,
      period: {
        month: filterMonth,
        year: filterYear,
      },
    };

    console.log('✅ Performance statistics calculated');

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('❌ Get Performance Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching performance statistics',
      error: error.message,
    });
  }
};

// @desc    Get department-wise performance comparison
// @route   GET /api/performance/department/:dept
// @access  Private (HR, TL)
export const getDepartmentPerformance = async (req, res) => {
  try {
    const { dept } = req.params;
    const { month, year } = req.query;

    console.log(`📊 GET /api/performance/department/${dept} - Fetching department performance...`);

    // Get current period
    const currentDate = new Date();
    const filterMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const filterYear = year ? parseInt(year) : currentDate.getFullYear();

    // Get employees from department
    const employees = await Employee.find({ department: dept });
    const employeeIds = employees.map(e => e.employeeId);

    // Get performance records
    const performances = await Performance.find({
      employeeId: { $in: employeeIds },
      'reviewPeriod.month': filterMonth,
      'reviewPeriod.year': filterYear,
    }).populate('userId', 'firstName lastName');

    // Calculate department metrics
    const totalEmployees = performances.length;
    const avgScore = totalEmployees > 0
      ? (performances.reduce((sum, p) => sum + p.overallScore, 0) / totalEmployees).toFixed(1)
      : 0;

    const avgRating = totalEmployees > 0
      ? (performances.reduce((sum, p) => sum + p.rating, 0) / totalEmployees).toFixed(1)
      : 0;

    const topPerformers = performances.filter(p => p.overallScore >= 90).length;
    const totalTasksCompleted = performances.reduce((sum, p) => sum + p.tasksCompleted, 0);
    const totalProjects = performances.reduce((sum, p) => sum + p.activeProjects + p.completedProjects, 0);

    // Employee details
    const employeeDetails = performances.map(p => ({
      employeeId: p.employeeId,
      name: p.userId ? `${p.userId.firstName} ${p.userId.lastName}` : 'N/A',
      score: p.overallScore,
      rating: p.rating,
      tasksCompleted: p.tasksCompleted,
      attendance: p.attendanceRate,
    })).sort((a, b) => b.score - a.score);

    const departmentData = {
      department: dept,
      totalEmployees,
      avgScore: parseFloat(avgScore),
      avgRating: parseFloat(avgRating),
      topPerformers,
      totalTasksCompleted,
      totalProjects,
      employees: employeeDetails,
      period: {
        month: filterMonth,
        year: filterYear,
      },
    };

    console.log(`✅ Fetched performance data for ${dept} department`);

    res.status(200).json({
      success: true,
      data: departmentData,
    });
  } catch (error) {
    console.error('❌ Get Department Performance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching department performance',
      error: error.message,
    });
  }
};

// ============================================
// GOALS & OBJECTIVES APIs
// ============================================

// @desc    Get employee goals
// @route   GET /api/performance/:employeeId/goals
// @access  Private (HR, TL, Employee - own goals)
export const getEmployeeGoals = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, isActive } = req.query;

    console.log(`🎯 GET /api/performance/${employeeId}/goals - Fetching goals...`);

    // Validate employee
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Build filter
    const filter = { employeeId };
    if (status) filter.status = status;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Fetch goals
    const goals = await Goal.find(filter)
      .populate('assignedBy', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'Completed').length;
    const inProgressGoals = goals.filter(g => g.status === 'In Progress').length;
    const notStartedGoals = goals.filter(g => g.status === 'Not Started').length;
    const overdueGoals = goals.filter(g => 
      new Date() > new Date(g.targetDate) && g.status !== 'Completed'
    ).length;

    const avgProgress = totalGoals > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals)
      : 0;

    const formattedGoals = goals.map(goal => ({
      id: goal._id,
      goalId: goal._id,
      employeeId: goal.employeeId,
      title: goal.title,
      description: goal.description,
      category: goal.category,
      priority: goal.priority,
      status: goal.status,
      progress: goal.progress,
      targetDate: goal.targetDate,
      startDate: goal.startDate,
      completedDate: goal.completedDate,
      milestones: goal.milestones,
      performanceImpact: goal.performanceImpact,
      skillsToImprove: goal.skillsToImprove,
      assignedBy: goal.assignedBy ? `${goal.assignedBy.firstName} ${goal.assignedBy.lastName}` : null,
      reviewedBy: goal.reviewedBy ? `${goal.reviewedBy.firstName} ${goal.reviewedBy.lastName}` : null,
      lastReviewDate: goal.lastReviewDate,
      isOverdue: new Date() > new Date(goal.targetDate) && goal.status !== 'Completed',
      daysRemaining: Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)),
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    }));

    console.log(`✅ Fetched ${totalGoals} goals for ${employeeId}`);

    res.status(200).json({
      success: true,
      count: totalGoals,
      stats: {
        total: totalGoals,
        completed: completedGoals,
        inProgress: inProgressGoals,
        notStarted: notStartedGoals,
        overdue: overdueGoals,
        avgProgress,
      },
      data: formattedGoals,
    });
  } catch (error) {
    console.error('❌ Get Employee Goals Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee goals',
      error: error.message,
    });
  }
};

// @desc    Add new goal for employee
// @route   POST /api/performance/:employeeId/goals
// @access  Private (HR, TL)
export const addEmployeeGoal = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const {
      title,
      description,
      category,
      priority,
      targetDate,
      startDate,
      milestones,
      performanceImpact,
      skillsToImprove,
    } = req.body;

    console.log(`🎯 POST /api/performance/${employeeId}/goals - Adding new goal...`);

    // Validate employee
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Validate required fields
    if (!title || !targetDate) {
      return res.status(400).json({
        success: false,
        message: 'Title and target date are required',
      });
    }

    // Create goal
    const goal = await Goal.create({
      employeeId,
      userId: employee.userId,
      title,
      description: description || '',
      category: category || 'Performance',
      priority: priority || 'Medium',
      targetDate: new Date(targetDate),
      startDate: startDate ? new Date(startDate) : new Date(),
      milestones: milestones || [],
      performanceImpact: performanceImpact || 'Medium',
      skillsToImprove: skillsToImprove || [],
      assignedBy: req.user._id,
      status: 'In Progress',
    });

    console.log(`✅ Goal created successfully for ${employeeId}`);

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal,
    });
  } catch (error) {
    console.error('❌ Add Employee Goal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating goal',
      error: error.message,
    });
  }
};

// @desc    Update goal progress
// @route   PUT /api/performance/goals/:goalId
// @access  Private (HR, TL, Employee - own goals)
export const updateGoalProgress = async (req, res) => {
  try {
    const { goalId } = req.params;
    const {
      progress,
      status,
      notes,
      milestones,
      completedDate,
    } = req.body;

    console.log(`🎯 PUT /api/performance/goals/${goalId} - Updating progress...`);

    // Find goal
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    // Update fields
    if (progress !== undefined) {
      goal.progress = Math.min(Math.max(progress, 0), 100);
    }

    if (status) {
      goal.status = status;
      if (status === 'Completed' && !goal.completedDate) {
        goal.completedDate = new Date();
      }
    }

    if (completedDate) {
      goal.completedDate = new Date(completedDate);
    }

    if (milestones) {
      goal.milestones = milestones;
    }

    // Add note
    if (notes) {
      goal.notes.push({
        note: notes,
        addedBy: req.user._id,
        date: new Date(),
      });
    }

    goal.reviewedBy = req.user._id;
    goal.lastReviewDate = new Date();

    await goal.save();

    console.log(`✅ Goal ${goalId} updated successfully`);

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: goal,
    });
  } catch (error) {
    console.error('❌ Update Goal Progress Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating goal',
      error: error.message,
    });
  }
};

// @desc    Get my performance data (for logged-in employee)
// @route   GET /api/performance/my
// @access  Private (Employee)
export const getMyPerformance = async (req, res) => {
  try {
    console.log('📊 GET /api/performance/my - Fetching my performance...');
    console.log('👤 User:', req.user.email, 'ID:', req.user._id);

    // Get employee record
    const employee = await Employee.findOne({ userId: req.user._id }).populate('userId', 'firstName lastName email');
    
    if (!employee) {
      console.log('❌ Employee record not found for user:', req.user.email);
      return res.status(404).json({
        success: false,
        message: 'Employee record not found',
      });
    }

    console.log('✅ Employee found:', employee.employeeId, employee.firstName, employee.lastName);
    console.log('Employee MongoDB ID:', employee._id);

    // Validate employeeId
    if (!employee.employeeId || employee.employeeId === 'EMP0000NaN' || employee.employeeId === undefined) {
      console.log('❌ Invalid employeeId:', employee.employeeId);
      return res.status(400).json({
        success: false,
        message: 'Employee ID is invalid. Please ensure employee record is properly set up.',
      });
    }

    // Get current period
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Try to get existing performance record for current period
    let performance = await Performance.findOne({
      employeeId: employee._id,  // Use MongoDB ObjectId instead of string employeeId
      'reviewPeriod.month': currentMonth,
      'reviewPeriod.year': currentYear,
    }).populate('reviewedBy', 'firstName lastName');

    // Get all historical reviews (performance records with feedback/rating)
    const allReviews = await Performance.find({
      employeeId: employee._id,  // Use MongoDB ObjectId instead of string employeeId
      feedback: { $exists: true, $ne: '' }, // Only records with feedback
    })
    .populate('reviewedBy', 'firstName lastName')
    .sort({ reviewDate: -1 })
    .limit(12); // Last 12 reviews

    console.log(`📊 Found ${allReviews.length} historical reviews`);

    // If no performance record exists for current period, calculate from scratch
    if (!performance) {
      console.log('📊 No performance record found for current period, calculating from tasks, attendance, projects...');

      // Calculate task metrics
      const tasks = await Task.find({
        assignedTo: employee._id,  // Use MongoDB ObjectId instead of string employeeId
        createdAt: {
          $gte: new Date(currentYear, currentMonth - 1, 1),
          $lt: new Date(currentYear, currentMonth, 1),
        },
      });

      const completedTasks = tasks.filter((t) => t.status === 'Completed');
      const tasksCompleted = completedTasks.length;
      const tasksCompletionRate = tasks.length > 0 ? ((tasksCompleted / tasks.length) * 100).toFixed(1) : 0;

      // Calculate attendance metrics
      const attendanceRecords = await Attendance.find({
        employeeId: employee.employeeId,  // Keep this as string employeeId if Attendance model expects it
        date: {
          $gte: new Date(currentYear, currentMonth - 1, 1),
          $lt: new Date(currentYear, currentMonth, 1),
        },
      });

      const presentDays = attendanceRecords.filter((a) => a.status === 'Present').length;
      const totalDays = attendanceRecords.length || 1;
      const attendanceRate = ((presentDays / totalDays) * 100).toFixed(1);

      // Calculate project metrics
      const projects = await Project.find({
        teamMembers: employee._id,  // Use MongoDB ObjectId instead of string employeeId
      });

      const activeProjects = projects.filter((p) => p.status === 'In Progress').length;
      const completedProjects = projects.filter((p) => p.status === 'Completed').length;

      // Calculate overall performance score
      const taskScore = parseFloat(tasksCompletionRate) * 0.4;
      const attendanceScore = parseFloat(attendanceRate) * 0.3;
      const projectScore = (completedProjects > 0 ? (completedProjects / (completedProjects + activeProjects)) * 100 : 50) * 0.3;
      const overallScore = (taskScore + attendanceScore + projectScore).toFixed(1);

      // Format reviews
      const formattedReviews = allReviews.map((review) => ({
        rating: review.rating,
        feedback: review.feedback,
        strengths: review.strengths || [],
        areasForImprovement: review.areasForImprovement || [],
        achievements: review.achievements || [],
        skills: review.skills || [],
        reviewedBy: review.reviewedBy ? `${review.reviewedBy.firstName} ${review.reviewedBy.lastName}` : 'HR',
        reviewDate: review.reviewDate,
        reviewPeriod: review.reviewPeriod,
        quarter: `Q${Math.ceil(review.reviewPeriod.month / 3)} ${review.reviewPeriod.year}`,
      }));

      // Return calculated data
      const performanceData = {
        employeeId: employee.employeeId,
        name: `${employee.firstName} ${employee.lastName}`,
        role: employee.designation || employee.role || 'N/A',
        department: employee.department || 'N/A',
        email: employee.userId?.email || 'N/A',
        performance: parseFloat(overallScore),
        rating: overallScore >= 90 ? 5 : overallScore >= 80 ? 4 : overallScore >= 70 ? 3 : overallScore >= 60 ? 2 : 1,
        tasksCompleted,
        totalTasks: tasks.length,
        tasksCompletionRate: parseFloat(tasksCompletionRate),
        attendance: parseFloat(attendanceRate),
        presentDays,
        totalDays,
        activeProjects,
        completedProjects,
        totalProjects: projects.length,
        reviews: formattedReviews,
        reviewPeriod: {
          month: currentMonth,
          year: currentYear,
        },
        calculated: true, // Flag to indicate this is calculated, not stored
      };

      console.log('✅ My performance data calculated:', performanceData.performance + '%');

      return res.status(200).json({
        success: true,
        data: performanceData,
      });
    }

    // Performance record exists for current period
    console.log('✅ Performance record found:', performance.overallScore);

    // Format reviews
    const formattedReviews = allReviews.map((review) => ({
      rating: review.rating,
      feedback: review.feedback,
      strengths: review.strengths || [],
      areasForImprovement: review.areasForImprovement || [],
      achievements: review.achievements || [],
      skills: review.skills || [],
      reviewedBy: review.reviewedBy ? `${review.reviewedBy.firstName} ${review.reviewedBy.lastName}` : 'HR',
      reviewDate: review.reviewDate,
      reviewPeriod: review.reviewPeriod,
      quarter: `Q${Math.ceil(review.reviewPeriod.month / 3)} ${review.reviewPeriod.year}`,
    }));

    const performanceData = {
      employeeId: performance.employeeId,
      name: employee.userId ? `${employee.userId.firstName} ${employee.userId.lastName}` : `${employee.firstName} ${employee.lastName}`,
      role: employee.designation || employee.role || 'N/A',
      department: employee.department || 'N/A',
      email: employee.userId?.email || 'N/A',
      performance: performance.overallScore,
      rating: performance.rating,
      tasksCompleted: performance.tasksCompleted,
      totalTasks: performance.totalTasks || performance.tasksCompleted,
      tasksCompletionRate: performance.taskCompletionRate,
      attendance: performance.attendanceRate,
      presentDays: performance.presentDays,
      totalDays: performance.totalDays,
      activeProjects: performance.activeProjects,
      completedProjects: performance.completedProjects,
      totalProjects: performance.activeProjects + performance.completedProjects,
      strengths: performance.strengths || [],
      improvements: performance.areasForImprovement || [],
      achievements: performance.achievements || [],
      feedback: performance.feedback,
      reviews: formattedReviews,
      reviewedBy: performance.reviewedBy ? `${performance.reviewedBy.firstName} ${performance.reviewedBy.lastName}` : null,
      lastReviewDate: performance.lastReviewDate,
      reviewPeriod: performance.reviewPeriod,
    };

    res.status(200).json({
      success: true,
      data: performanceData,
    });
  } catch (error) {
    console.error('❌ Get My Performance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching my performance data',
      error: error.message,
    });
  }
};

