import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import Leave from '../models/Leave.js';
import Task from '../models/Task.js';
import Report from '../models/Report.js';
import Payslip from '../models/Payslip.js';

// @desc    Get attendance report
// @route   GET /api/reports/attendance
// @access  Private (HR, TL)
export const getAttendanceReport = async (req, res) => {
  try {
    const { dateFrom, dateTo, department, employeeId } = req.query;

    // Build filter
    const filter = {};
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    // Get employee filter based on department or specific employee
    let employeeFilter = {};
    if (department) {
      employeeFilter.department = department;
    }
    if (employeeId) {
      employeeFilter.employeeId = employeeId;
    }

    const employees = await Employee.find(employeeFilter).select('employeeId firstName lastName department');
    const employeeIds = employees.map((emp) => emp.employeeId);

    if (employeeIds.length > 0) {
      filter.employeeId = { $in: employeeIds };
    }

    // Fetch attendance records
    const attendanceRecords = await Attendance.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ date: -1 });

    // Calculate statistics
    const totalRecords = attendanceRecords.length;
    const presentDays = attendanceRecords.filter((record) => record.status === 'Present').length;
    const absentDays = attendanceRecords.filter((record) => record.status === 'Absent').length;
    const lateDays = attendanceRecords.filter((record) => record.isLate).length;

    // Calculate average working hours
    const totalWorkingHours = attendanceRecords.reduce((sum, record) => {
      return sum + (record.workingHours || 0);
    }, 0);
    const avgWorkingHours = totalRecords > 0 ? (totalWorkingHours / totalRecords).toFixed(2) : 0;

    // Group by employee
    const employeeStats = {};
    attendanceRecords.forEach((record) => {
      const empId = record.employeeId;
      if (!employeeStats[empId]) {
        employeeStats[empId] = {
          employeeId: empId,
          name: record.userId ? `${record.userId.firstName} ${record.userId.lastName}` : 'N/A',
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          lateDays: 0,
          totalWorkingHours: 0,
        };
      }
      employeeStats[empId].totalDays++;
      if (record.status === 'Present') employeeStats[empId].presentDays++;
      if (record.status === 'Absent') employeeStats[empId].absentDays++;
      if (record.isLate) employeeStats[empId].lateDays++;
      employeeStats[empId].totalWorkingHours += record.workingHours || 0;
    });

    // Convert to array and calculate averages
    const employeeData = Object.values(employeeStats).map((emp) => ({
      ...emp,
      avgWorkingHours: emp.totalDays > 0 ? (emp.totalWorkingHours / emp.totalDays).toFixed(2) : 0,
      attendanceRate: emp.totalDays > 0 ? ((emp.presentDays / emp.totalDays) * 100).toFixed(2) + '%' : '0%',
    }));

    // Save report to database
    const report = await Report.create({
      reportType: 'Attendance',
      generatedBy: req.user._id,
      dateFrom: dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      dateTo: dateTo ? new Date(dateTo) : new Date(),
      department: department || undefined,
      employeeId: employeeId || undefined,
      data: attendanceRecords,
      summary: {
        totalRecords,
        presentDays,
        absentDays,
        lateDays,
        avgWorkingHours,
        employeeData,
      },
    });

    res.status(200).json({
      success: true,
      report: {
        reportId: report._id,
        reportType: 'Attendance',
        dateFrom: report.dateFrom,
        dateTo: report.dateTo,
        department: department || 'All',
        employeeId: employeeId || 'All',
      },
      summary: {
        totalRecords,
        presentDays,
        absentDays,
        lateDays,
        avgWorkingHours: parseFloat(avgWorkingHours),
      },
      employeeData,
    });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate attendance report',
      error: error.message,
    });
  }
};

// @desc    Get performance report
// @route   GET /api/reports/performance
// @access  Private (HR, TL)
export const getPerformanceReport = async (req, res) => {
  try {
    const { dateFrom, dateTo, department, employeeId } = req.query;

    // Build filter for tasks
    const filter = {};
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Get employee filter
    let employeeFilter = {};
    if (department) {
      employeeFilter.department = department;
    }
    if (employeeId) {
      employeeFilter.employeeId = employeeId;
    }

    const employees = await Employee.find(employeeFilter).select('employeeId firstName lastName department');
    const employeeIds = employees.map((emp) => emp.employeeId);

    if (employeeIds.length > 0) {
      filter.assignedTo = { $in: employeeIds };
    }

    // Fetch tasks
    const tasks = await Task.find(filter)
      .populate('assignedToUser', 'firstName lastName email')
      .populate('assignedByUser', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === 'Completed').length;
    const inProgressTasks = tasks.filter((task) => task.status === 'In Progress').length;
    const pendingTasks = tasks.filter((task) => task.status === 'Pending').length;
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0;

    // Priority breakdown
    const highPriorityTasks = tasks.filter((task) => task.priority === 'High').length;
    const mediumPriorityTasks = tasks.filter((task) => task.priority === 'Medium').length;
    const lowPriorityTasks = tasks.filter((task) => task.priority === 'Low').length;

    // Group by employee
    const employeeStats = {};
    tasks.forEach((task) => {
      const empId = task.assignedTo;
      if (!employeeStats[empId]) {
        employeeStats[empId] = {
          employeeId: empId,
          name: task.assignedToUser ? `${task.assignedToUser.firstName} ${task.assignedToUser.lastName}` : 'N/A',
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          pendingTasks: 0,
          highPriorityTasks: 0,
        };
      }
      employeeStats[empId].totalTasks++;
      if (task.status === 'Completed') employeeStats[empId].completedTasks++;
      if (task.status === 'In Progress') employeeStats[empId].inProgressTasks++;
      if (task.status === 'Pending') employeeStats[empId].pendingTasks++;
      if (task.priority === 'High') employeeStats[empId].highPriorityTasks++;
    });

    // Convert to array and calculate rates
    const employeeData = Object.values(employeeStats).map((emp) => ({
      ...emp,
      completionRate:
        emp.totalTasks > 0 ? ((emp.completedTasks / emp.totalTasks) * 100).toFixed(2) + '%' : '0%',
      productivity:
        emp.totalTasks > 0
          ? emp.completedTasks >= emp.totalTasks * 0.8
            ? 'Excellent'
            : emp.completedTasks >= emp.totalTasks * 0.6
            ? 'Good'
            : emp.completedTasks >= emp.totalTasks * 0.4
            ? 'Average'
            : 'Below Average'
          : 'No Data',
    }));

    // Save report
    const report = await Report.create({
      reportType: 'Performance',
      generatedBy: req.user._id,
      dateFrom: dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      dateTo: dateTo ? new Date(dateTo) : new Date(),
      department: department || undefined,
      employeeId: employeeId || undefined,
      data: tasks,
      summary: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        completionRate,
        highPriorityTasks,
        mediumPriorityTasks,
        lowPriorityTasks,
        employeeData,
      },
    });

    res.status(200).json({
      success: true,
      report: {
        reportId: report._id,
        reportType: 'Performance',
        dateFrom: report.dateFrom,
        dateTo: report.dateTo,
        department: department || 'All',
        employeeId: employeeId || 'All',
      },
      summary: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        completionRate: parseFloat(completionRate) + '%',
        priorityBreakdown: {
          high: highPriorityTasks,
          medium: mediumPriorityTasks,
          low: lowPriorityTasks,
        },
      },
      employeeData,
    });
  } catch (error) {
    console.error('Error generating performance report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate performance report',
      error: error.message,
    });
  }
};

// @desc    Get leave report
// @route   GET /api/reports/leave
// @access  Private (HR, TL)
export const getLeaveReport = async (req, res) => {
  try {
    const { dateFrom, dateTo, department, employeeId, status } = req.query;

    // Build filter
    const filter = {};
    if (dateFrom || dateTo) {
      filter.startDate = {};
      if (dateFrom) filter.startDate.$gte = new Date(dateFrom);
      if (dateTo) filter.startDate.$lte = new Date(dateTo);
    }
    if (status) {
      filter.status = status;
    }

    // Get employee filter
    let employeeFilter = {};
    if (department) {
      employeeFilter.department = department;
    }
    if (employeeId) {
      employeeFilter.employeeId = employeeId;
    }

    const employees = await Employee.find(employeeFilter).select('employeeId firstName lastName department');
    const employeeIds = employees.map((emp) => emp.employeeId);

    if (employeeIds.length > 0) {
      filter.employeeId = { $in: employeeIds };
    }

    // Fetch leave records
    const leaveRecords = await Leave.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalLeaves = leaveRecords.length;
    const approvedLeaves = leaveRecords.filter((leave) => leave.status === 'Approved').length;
    const pendingLeaves = leaveRecords.filter((leave) => leave.status === 'Pending').length;
    const rejectedLeaves = leaveRecords.filter((leave) => leave.status === 'Rejected').length;

    // Leave type breakdown
    const sickLeaves = leaveRecords.filter((leave) => leave.leaveType === 'Sick Leave').length;
    const casualLeaves = leaveRecords.filter((leave) => leave.leaveType === 'Casual Leave').length;
    const earnedLeaves = leaveRecords.filter((leave) => leave.leaveType === 'Earned Leave').length;
    const maternityLeaves = leaveRecords.filter((leave) => leave.leaveType === 'Maternity Leave').length;
    const paternityLeaves = leaveRecords.filter((leave) => leave.leaveType === 'Paternity Leave').length;

    // Calculate total days
    const totalLeaveDays = leaveRecords.reduce((sum, leave) => sum + leave.totalDays, 0);
    const approvedLeaveDays = leaveRecords
      .filter((leave) => leave.status === 'Approved')
      .reduce((sum, leave) => sum + leave.totalDays, 0);

    // Group by employee
    const employeeStats = {};
    leaveRecords.forEach((leave) => {
      const empId = leave.employeeId;
      if (!employeeStats[empId]) {
        employeeStats[empId] = {
          employeeId: empId,
          name: leave.userId ? `${leave.userId.firstName} ${leave.userId.lastName}` : 'N/A',
          totalRequests: 0,
          approvedRequests: 0,
          pendingRequests: 0,
          rejectedRequests: 0,
          totalDaysRequested: 0,
          totalDaysApproved: 0,
        };
      }
      employeeStats[empId].totalRequests++;
      if (leave.status === 'Approved') employeeStats[empId].approvedRequests++;
      if (leave.status === 'Pending') employeeStats[empId].pendingRequests++;
      if (leave.status === 'Rejected') employeeStats[empId].rejectedRequests++;
      employeeStats[empId].totalDaysRequested += leave.totalDays;
      if (leave.status === 'Approved') {
        employeeStats[empId].totalDaysApproved += leave.totalDays;
      }
    });

    // Convert to array
    const employeeData = Object.values(employeeStats).map((emp) => ({
      ...emp,
      approvalRate:
        emp.totalRequests > 0 ? ((emp.approvedRequests / emp.totalRequests) * 100).toFixed(2) + '%' : '0%',
    }));

    // Save report
    const report = await Report.create({
      reportType: 'Leave',
      generatedBy: req.user._id,
      dateFrom: dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      dateTo: dateTo ? new Date(dateTo) : new Date(),
      department: department || undefined,
      employeeId: employeeId || undefined,
      data: leaveRecords,
      summary: {
        totalLeaves,
        approvedLeaves,
        pendingLeaves,
        rejectedLeaves,
        totalLeaveDays,
        approvedLeaveDays,
        leaveTypeBreakdown: {
          sickLeaves,
          casualLeaves,
          earnedLeaves,
          maternityLeaves,
          paternityLeaves,
        },
        employeeData,
      },
    });

    res.status(200).json({
      success: true,
      report: {
        reportId: report._id,
        reportType: 'Leave',
        dateFrom: report.dateFrom,
        dateTo: report.dateTo,
        department: department || 'All',
        employeeId: employeeId || 'All',
      },
      summary: {
        totalLeaves,
        approvedLeaves,
        pendingLeaves,
        rejectedLeaves,
        totalLeaveDays,
        approvedLeaveDays,
        leaveTypeBreakdown: {
          sickLeave: sickLeaves,
          casualLeave: casualLeaves,
          earnedLeave: earnedLeaves,
          maternityLeave: maternityLeaves,
          paternityLeave: paternityLeaves,
        },
      },
      employeeData,
    });
  } catch (error) {
    console.error('Error generating leave report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate leave report',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// @desc    Get employee report
// @route   GET /api/reports/employee
// @access  Private (HR, TL)
export const getEmployeeReport = async (req, res) => {
  try {
    const { department, employeeId, status } = req.query;

    // Build filter
    let filter = {};
    if (department) filter.department = department;
    if (employeeId) filter.employeeId = employeeId;
    if (status) filter.status = status;

    // Fetch employees with populated user data
    const employees = await Employee.find(filter)
      .populate('userId', 'firstName lastName email phoneNumber role')
      .sort({ employeeId: 1 });

    // Calculate statistics
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === 'Active').length;
    const inactiveEmployees = employees.filter(emp => emp.status === 'Inactive').length;

    // Department breakdown
    const departmentStats = {};
    employees.forEach(emp => {
      if (!departmentStats[emp.department]) {
        departmentStats[emp.department] = {
          department: emp.department,
          count: 0,
          active: 0,
          inactive: 0,
        };
      }
      departmentStats[emp.department].count++;
      if (emp.status === 'Active') departmentStats[emp.department].active++;
      else departmentStats[emp.department].inactive++;
    });

    const departmentData = Object.values(departmentStats);

    // Position breakdown
    const positionStats = {};
    employees.forEach(emp => {
      const position = emp.position || 'Not Specified';
      if (!positionStats[position]) {
        positionStats[position] = 0;
      }
      positionStats[position]++;
    });

    // Format employee data
    const employeeData = employees.map(emp => ({
      employeeId: emp.employeeId,
      name: emp.userId ? `${emp.userId.firstName} ${emp.userId.lastName}` : 'N/A',
      email: emp.userId?.email,
      phone: emp.userId?.phoneNumber,
      department: emp.department,
      position: emp.position,
      joiningDate: emp.joiningDate,
      status: emp.status,
      salary: emp.salary,
    }));

    // Save report
    const report = await Report.create({
      reportType: 'Employee',
      generatedBy: req.user._id,
      dateFrom: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      dateTo: new Date(),
      department: department || undefined,
      employeeId: employeeId || undefined,
      data: employees,
      summary: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        departmentData,
        positionBreakdown: positionStats,
        employeeData,
      },
    });

    res.status(200).json({
      success: true,
      report: {
        reportId: report._id,
        reportType: 'Employee',
        department: department || 'All',
        employeeId: employeeId || 'All',
      },
      summary: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        departmentData,
        positionBreakdown: positionStats,
      },
      employeeData,
    });
  } catch (error) {
    console.error('Error generating employee report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate employee report',
      error: error.message,
    });
  }
};

// @desc    Get project report
// @route   GET /api/reports/project
// @access  Private (HR, TL)
export const getProjectReport = async (req, res) => {
  try {
    const { dateFrom, dateTo, status, department } = req.query;

    // Build filter
    let filter = {};
    if (dateFrom || dateTo) {
      filter.startDate = {};
      if (dateFrom) filter.startDate.$gte = new Date(dateFrom);
      if (dateTo) filter.startDate.$lte = new Date(dateTo);
    }
    if (status) filter.status = status;

    // Fetch projects
    const projects = await Task.find({ projectId: { $exists: true } })
      .populate('assignedToUser', 'firstName lastName')
      .populate('assignedByUser', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const inProgressProjects = projects.filter(p => p.status === 'In Progress').length;
    const pendingProjects = projects.filter(p => p.status === 'Pending').length;

    // Group by project
    const projectStats = {};
    projects.forEach(task => {
      const projId = task.projectId || task.title;
      if (!projectStats[projId]) {
        projectStats[projId] = {
          projectId: projId,
          projectName: task.title,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          pendingTasks: 0,
          teamMembers: new Set(),
        };
      }
      projectStats[projId].totalTasks++;
      if (task.status === 'Completed') projectStats[projId].completedTasks++;
      if (task.status === 'In Progress') projectStats[projId].inProgressTasks++;
      if (task.status === 'Pending') projectStats[projId].pendingTasks++;
      if (task.assignedTo) projectStats[projId].teamMembers.add(task.assignedTo);
    });

    const projectData = Object.values(projectStats).map(proj => ({
      ...proj,
      teamSize: proj.teamMembers.size,
      completionRate: proj.totalTasks > 0 ? ((proj.completedTasks / proj.totalTasks) * 100).toFixed(2) + '%' : '0%',
      teamMembers: Array.from(proj.teamMembers),
    }));

    // Save report
    const report = await Report.create({
      reportType: 'Project',
      generatedBy: req.user._id,
      dateFrom: dateFrom ? new Date(dateFrom) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      dateTo: dateTo ? new Date(dateTo) : new Date(),
      data: projects,
      summary: {
        totalProjects,
        completedProjects,
        inProgressProjects,
        pendingProjects,
        projectData,
      },
    });

    res.status(200).json({
      success: true,
      report: {
        reportId: report._id,
        reportType: 'Project',
        dateFrom: report.dateFrom,
        dateTo: report.dateTo,
      },
      summary: {
        totalProjects,
        completedProjects,
        inProgressProjects,
        pendingProjects,
      },
      projectData,
    });
  } catch (error) {
    console.error('Error generating project report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate project report',
      error: error.message,
    });
  }
};

// @desc    Get payroll report
// @route   GET /api/reports/payroll
// @access  Private (HR)
export const getPayrollReport = async (req, res) => {
  try {
    const { month, year, department, employeeId } = req.query;

    // Build filter
    let filter = {};
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);

    // Fetch payslips
    const payslips = await Payslip.find(filter).sort({ year: -1, month: -1 });

    // Filter by department or employee if needed
    let filteredPayslips = payslips;
    if (department || employeeId) {
      const empFilter = {};
      if (department) empFilter.department = department;
      if (employeeId) empFilter.employeeId = employeeId;
      
      const employees = await Employee.find(empFilter).select('employeeId');
      const employeeIds = employees.map(emp => emp.employeeId);
      
      filteredPayslips = payslips.filter(payslip => employeeIds.includes(payslip.employeeId));
    }

    // Calculate statistics
    const totalPayslips = filteredPayslips.length;
    const totalGrossSalary = filteredPayslips.reduce((sum, p) => sum + (p.grossSalary || 0), 0);
    const totalDeductions = filteredPayslips.reduce((sum, p) => {
      const ded = p.deductions || {};
      return sum + (ded.PF || 0) + (ded.tax || 0) + (ded.insurance || 0) + (ded.other || 0);
    }, 0);
    const totalNetSalary = filteredPayslips.reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const totalFinalSalary = filteredPayslips.reduce((sum, p) => sum + (p.finalSalary || 0), 0);

    // Payment status breakdown
    const paidPayslips = filteredPayslips.filter(p => p.status === 'Paid').length;
    const pendingPayslips = filteredPayslips.filter(p => p.status === 'Pending').length;
    const processingPayslips = filteredPayslips.filter(p => p.status === 'Processing').length;

    // Employee-wise data
    const employeeData = filteredPayslips.map(payslip => ({
      employeeId: payslip.employeeId,
      employeeName: payslip.employeeName,
      month: payslip.month,
      year: payslip.year,
      grossSalary: payslip.grossSalary,
      deductions: payslip.deductions,
      netSalary: payslip.netSalary,
      finalSalary: payslip.finalSalary,
      status: payslip.status,
      paidDate: payslip.paidDate,
    }));

    // Save report
    const report = await Report.create({
      reportType: 'Payroll',
      generatedBy: req.user._id,
      dateFrom: month && year ? new Date(year, month - 1, 1) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      dateTo: month && year ? new Date(year, month, 0) : new Date(),
      department: department || undefined,
      employeeId: employeeId || undefined,
      data: filteredPayslips,
      summary: {
        totalPayslips,
        totalGrossSalary,
        totalDeductions,
        totalNetSalary,
        totalFinalSalary,
        paidPayslips,
        pendingPayslips,
        processingPayslips,
        employeeData,
      },
    });

    res.status(200).json({
      success: true,
      report: {
        reportId: report._id,
        reportType: 'Payroll',
        month: month || 'All',
        year: year || 'All',
        department: department || 'All',
      },
      summary: {
        totalPayslips,
        totalGrossSalary,
        totalDeductions,
        totalNetSalary,
        totalFinalSalary,
        paymentStatus: {
          paid: paidPayslips,
          pending: pendingPayslips,
          processing: processingPayslips,
        },
      },
      employeeData,
    });
  } catch (error) {
    console.error('Error generating payroll report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate payroll report',
      error: error.message,
    });
  }
};

// @desc    Export report as PDF
// @route   GET /api/reports/:reportId/export
// @access  Private (HR, TL)
export const exportReportPDF = async (req, res) => {
  try {
    const { reportId } = req.params;

    // Fetch report from database
    const report = await Report.findById(reportId).populate('generatedBy', 'firstName lastName');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    // Import PDFDocument
    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${report.reportType}_Report_${reportId}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add header
    doc.fontSize(20).font('Helvetica-Bold').text(`${report.reportType} Report`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date(report.generatedDate).toLocaleDateString()}`, { align: 'center' });
    doc.text(`Generated by: ${report.generatedBy ? `${report.generatedBy.firstName} ${report.generatedBy.lastName}` : 'System'}`, { align: 'center' });
    doc.text(`Period: ${new Date(report.dateFrom).toLocaleDateString()} - ${new Date(report.dateTo).toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Add summary section
    doc.fontSize(14).font('Helvetica-Bold').text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');

    const summary = report.summary || {};

    switch (report.reportType) {
      case 'Attendance':
        doc.text(`Total Records: ${summary.totalRecords || 0}`);
        doc.text(`Present Days: ${summary.presentDays || 0}`);
        doc.text(`Absent Days: ${summary.absentDays || 0}`);
        doc.text(`Late Days: ${summary.lateDays || 0}`);
        doc.text(`Average Working Hours: ${summary.avgWorkingHours || 0}`);
        break;

      case 'Performance':
        doc.text(`Total Tasks: ${summary.totalTasks || 0}`);
        doc.text(`Completed Tasks: ${summary.completedTasks || 0}`);
        doc.text(`In Progress Tasks: ${summary.inProgressTasks || 0}`);
        doc.text(`Pending Tasks: ${summary.pendingTasks || 0}`);
        doc.text(`Completion Rate: ${summary.completionRate || 0}%`);
        break;

      case 'Leave':
        doc.text(`Total Leaves: ${summary.totalLeaves || 0}`);
        doc.text(`Approved Leaves: ${summary.approvedLeaves || 0}`);
        doc.text(`Pending Leaves: ${summary.pendingLeaves || 0}`);
        doc.text(`Rejected Leaves: ${summary.rejectedLeaves || 0}`);
        doc.text(`Total Leave Days: ${summary.totalLeaveDays || 0}`);
        break;

      case 'Employee':
        doc.text(`Total Employees: ${summary.totalEmployees || 0}`);
        doc.text(`Active Employees: ${summary.activeEmployees || 0}`);
        doc.text(`Inactive Employees: ${summary.inactiveEmployees || 0}`);
        break;

      case 'Project':
        doc.text(`Total Projects: ${summary.totalProjects || 0}`);
        doc.text(`Completed Projects: ${summary.completedProjects || 0}`);
        doc.text(`In Progress Projects: ${summary.inProgressProjects || 0}`);
        doc.text(`Pending Projects: ${summary.pendingProjects || 0}`);
        break;

      case 'Payroll':
        doc.text(`Total Payslips: ${summary.totalPayslips || 0}`);
        doc.text(`Total Gross Salary: ₹${(summary.totalGrossSalary || 0).toLocaleString('en-IN')}`);
        doc.text(`Total Deductions: ₹${(summary.totalDeductions || 0).toLocaleString('en-IN')}`);
        doc.text(`Total Net Salary: ₹${(summary.totalNetSalary || 0).toLocaleString('en-IN')}`);
        doc.text(`Total Final Salary: ₹${(summary.totalFinalSalary || 0).toLocaleString('en-IN')}`);
        break;
    }

    doc.moveDown(2);

    // Add employee data table
    if (summary.employeeData && summary.employeeData.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('Detailed Data', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica');

      const tableTop = doc.y;
      const employeeData = summary.employeeData.slice(0, 20); // Limit to first 20 records

      // Table headers based on report type
      let headers = [];
      switch (report.reportType) {
        case 'Attendance':
          headers = ['Employee ID', 'Name', 'Total Days', 'Present', 'Absent', 'Late'];
          break;
        case 'Performance':
          headers = ['Employee ID', 'Name', 'Total Tasks', 'Completed', 'In Progress'];
          break;
        case 'Leave':
          headers = ['Employee ID', 'Name', 'Total Leaves', 'Approved', 'Pending'];
          break;
        case 'Employee':
          headers = ['Employee ID', 'Name', 'Department', 'Position', 'Status'];
          break;
        case 'Payroll':
          headers = ['Employee ID', 'Name', 'Gross Salary', 'Net Salary', 'Status'];
          break;
      }

      // Draw table headers
      let x = 50;
      const colWidth = (doc.page.width - 100) / headers.length;
      headers.forEach(header => {
        doc.text(header, x, tableTop, { width: colWidth, align: 'left' });
        x += colWidth;
      });

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
      doc.moveDown(0.5);

      // Draw table rows
      employeeData.forEach((emp, index) => {
        if (doc.y > 700) {
          doc.addPage();
          doc.fontSize(9).font('Helvetica');
        }

        x = 50;
        const rowData = [];

        switch (report.reportType) {
          case 'Attendance':
            rowData = [emp.employeeId, emp.name, emp.totalDays, emp.presentDays, emp.absentDays, emp.lateDays];
            break;
          case 'Performance':
            rowData = [emp.employeeId, emp.name, emp.totalTasks, emp.completedTasks, emp.inProgressTasks];
            break;
          case 'Leave':
            rowData = [emp.employeeId, emp.name, emp.totalLeaves, emp.approvedLeaves, emp.pendingLeaves];
            break;
          case 'Employee':
            rowData = [emp.employeeId, emp.name, emp.department, emp.position, emp.status];
            break;
          case 'Payroll':
            rowData = [emp.employeeId, emp.employeeName || emp.name, `₹${(emp.grossSalary || 0).toLocaleString('en-IN')}`, `₹${(emp.netSalary || 0).toLocaleString('en-IN')}`, emp.status];
            break;
        }

        rowData.forEach(data => {
          doc.text(String(data || 'N/A'), x, doc.y, { width: colWidth, align: 'left', continued: true });
          x += colWidth;
        });
        doc.text(''); // End continued text
        doc.moveDown(0.3);
      });

      if (summary.employeeData.length > 20) {
        doc.moveDown();
        doc.fontSize(8).text(`... and ${summary.employeeData.length - 20} more records`, { align: 'center', italics: true });
      }
    }

    // Add footer
    doc.fontSize(8).text(`Page ${doc.bufferedPageRange().count}`, 50, doc.page.height - 50, { align: 'center' });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Export Report PDF Error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error exporting report',
        error: error.message,
      });
    }
  }
};

// @desc    Get recent reports
// @route   GET /api/reports/recent
// @access  Private (HR, TL)
export const getRecentReports = async (req, res) => {
  try {
    console.log('📅 GET /api/reports/recent - Fetching recent reports...');
    const { limit = 10 } = req.query;

    // Fetch recent reports sorted by creation date
    const reports = await Report.find()
      .populate('generatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    console.log(`✅ Found ${reports.length} reports in database`);

    // Format report data
    const formattedReports = reports.map(report => ({
      reportId: report._id,
      reportType: report.reportType,
      reportTitle: `${report.reportType} Report - ${new Date(report.dateFrom).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
      generatedDate: report.createdAt,
      generatedBy: report.generatedBy ? `${report.generatedBy.firstName} ${report.generatedBy.lastName}` : 'System',
      dateFrom: report.dateFrom,
      dateTo: report.dateTo,
      department: report.department || 'All',
      recordCount: report.summary?.totalRecords || report.summary?.totalEmployees || report.summary?.totalProjects || report.summary?.totalPayslips || 0,
    }));

    console.log('📊 Returning formatted reports:', formattedReports.length);

    res.status(200).json({
      success: true,
      count: formattedReports.length,
      data: formattedReports,
    });
  } catch (error) {
    console.error('❌ Get Recent Reports Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent reports',
      error: error.message,
    });
  }
};
