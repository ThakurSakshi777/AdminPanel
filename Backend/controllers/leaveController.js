import Leave from '../models/Leave.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// @desc    Get all leave requests
// @route   GET /api/leaves
// @access  Private (HR/TL)
export const getAllLeaves = async (req, res) => {
  try {
    const { status, employeeId, leaveType } = req.query;
    
    let filter = {};
    
    // Filter by status
    if (status) {
      filter.status = status;
    }
    
    // Filter by employee ID
    if (employeeId) {
      filter.employeeId = employeeId;
    }
    
    // Filter by leave type
    if (leaveType) {
      filter.leaveType = leaveType;
    }
    
    const leaves = await Leave.find(filter)
      .sort({ appliedDate: -1 })
      .limit(100);

    // Calculate statistics
    const totalLeaves = leaves.length;
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;
    const rejectedLeaves = leaves.filter(l => l.status === 'Rejected').length;

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
      statistics: {
        total: totalLeaves,
        pending: pendingLeaves,
        approved: approvedLeaves,
        rejected: rejectedLeaves,
      },
    });
  } catch (error) {
    console.error('Get All Leaves Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leave requests',
      error: error.message,
    });
  }
};

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (Employee)
export const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Validation
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: leaveType, startDate, endDate, reason',
      });
    }

    // Check if end date is after start date
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after or equal to start date',
      });
    }

    // Create leave request
    const leave = await Leave.create({
      userId: user._id,
      employeeId: user.employeeId,
      employeeName: user.name,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      status: 'Pending',
    });

    // Create notification for HR users
    try {
      const hrUsers = await User.find({ role: 'hr' });
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      
      for (const hrUser of hrUsers) {
        await createNotification(hrUser._id, {
          type: 'leave_request',
          title: 'New Leave Request',
          message: `${user.name} applied for ${leaveType} (${days} days)`,
          data: {
            employeeName: user.name,
            employeeId: user._id,
            leaveType,
            leaveDays: days,
            relatedId: leave._id
          },
          icon: 'leave',
          priority: 'high',
          link: '/leaves'
        });
      }
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leave,
    });
  } catch (error) {
    console.error('Apply Leave Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error applying for leave',
      error: error.message,
    });
  }
};

// @desc    Get my leaves
// @route   GET /api/leaves/my
// @access  Private (Employee)
export const getMyLeaves = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, year } = req.query;

    let filter = { userId: userId };

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by year
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      filter.startDate = { $gte: startOfYear, $lte: endOfYear };
    }

    const leaves = await Leave.find(filter).sort({ appliedDate: -1 });

    // Calculate statistics
    const totalLeaves = leaves.length;
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;
    const rejectedLeaves = leaves.filter(l => l.status === 'Rejected').length;
    const totalDaysTaken = leaves
      .filter(l => l.status === 'Approved')
      .reduce((sum, l) => sum + l.totalDays, 0);

    res.status(200).json({
      success: true,
      data: leaves,
      statistics: {
        total: totalLeaves,
        pending: pendingLeaves,
        approved: approvedLeaves,
        rejected: rejectedLeaves,
        totalDaysTaken,
      },
    });
  } catch (error) {
    console.error('Get My Leaves Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your leaves',
      error: error.message,
    });
  }
};

// @desc    Approve leave
// @route   PUT /api/leaves/:id/approve
// @access  Private (HR/TL)
export const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const approver = req.user;

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Leave is already ${leave.status}`,
      });
    }

    // Update leave status
    leave.status = 'Approved';
    leave.approvedBy = approver._id;
    leave.approvedByName = approver.name;
    leave.approvedDate = new Date();

    await leave.save();

    // Create notification for employee
    try {
      const employee = await User.findById(leave.userId);
      if (employee) {
        await createNotification(employee._id, {
          type: 'leave_approved',
          title: 'Leave Request Approved',
          message: `Your ${leave.leaveType} leave request has been approved`,
          data: {
            leaveType: leave.leaveType,
            relatedId: leave._id
          },
          icon: 'leave',
          priority: 'high',
          link: '/employee-leaves'
        });
      }
    } catch (notifError) {
      console.error('Error creating approval notification:', notifError);
    }

    res.status(200).json({
      success: true,
      message: 'Leave approved successfully',
      data: leave,
    });
  } catch (error) {
    console.error('Approve Leave Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving leave',
      error: error.message,
    });
  }
};

// @desc    Reject leave
// @route   PUT /api/leaves/:id/reject
// @access  Private (HR/TL)
export const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const approver = req.user;

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Leave is already ${leave.status}`,
      });
    }

    // Update leave status
    leave.status = 'Rejected';
    leave.approvedBy = approver._id;
    leave.approvedByName = approver.name;
    leave.rejectedDate = new Date();
    leave.rejectionReason = rejectionReason || 'No reason provided';

    await leave.save();

    // Create notification for employee
    try {
      const employee = await User.findById(leave.userId);
      if (employee) {
        await createNotification(employee._id, {
          type: 'leave_rejected',
          title: 'Leave Request Rejected',
          message: `Your ${leave.leaveType} leave request has been rejected`,
          data: {
            leaveType: leave.leaveType,
            relatedId: leave._id
          },
          icon: 'leave',
          priority: 'medium',
          link: '/employee-leaves'
        });
      }
    } catch (notifError) {
      console.error('Error creating rejection notification:', notifError);
    }

    res.status(200).json({
      success: true,
      message: 'Leave rejected successfully',
      data: leave,
    });
  } catch (error) {
    console.error('Reject Leave Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting leave',
      error: error.message,
    });
  }
};
