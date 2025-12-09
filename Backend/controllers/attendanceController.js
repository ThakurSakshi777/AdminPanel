import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private (HR/TL)
export const getAllAttendance = async (req, res) => {
  try {
    const { date, employeeId, status } = req.query;
    
    let filter = {};
    
    // Filter by date
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }
    
    // Filter by employee ID
    if (employeeId) {
      filter.employeeId = employeeId;
    }
    
    // Filter by status
    if (status) {
      filter.status = status;
    }
    
    const attendance = await Attendance.find(filter)
      .sort({ date: -1, checkInTime: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error('Get Attendance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance records',
      error: error.message,
    });
  }
};

// @desc    Employee check-in
// @route   POST /api/attendance/checkin
// @access  Private (Employee)
export const checkIn = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await Attendance.findOne({
      userId: userId,
      date: { $gte: today, $lt: tomorrow },
    });

    if (existingAttendance && existingAttendance.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today',
        data: existingAttendance,
      });
    }

    const checkInTime = new Date();
    
    // Check if late (after 9:30 AM)
    const nineThirty = new Date();
    nineThirty.setHours(9, 30, 0, 0);
    const isLate = checkInTime > nineThirty;

    // Create or update attendance
    let attendance;
    if (existingAttendance) {
      existingAttendance.checkInTime = checkInTime;
      existingAttendance.status = isLate ? 'Late' : 'Present';
      existingAttendance.isLate = isLate;
      attendance = await existingAttendance.save();
    } else {
      attendance = await Attendance.create({
        userId: user._id,
        employeeId: user.employeeId,
        employeeName: user.name,
        date: new Date(),
        checkInTime: checkInTime,
        status: isLate ? 'Late' : 'Present',
        isLate: isLate,
      });
    }

    res.status(200).json({
      success: true,
      message: `Checked in successfully${isLate ? ' (Late)' : ''}`,
      data: attendance,
    });
  } catch (error) {
    console.error('Check In Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during check-in',
      error: error.message,
    });
  }
};

// @desc    Employee check-out
// @route   POST /api/attendance/checkout
// @access  Private (Employee)
export const checkOut = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.findOne({
      userId: userId,
      date: { $gte: today, $lt: tomorrow },
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'No check-in record found for today',
      });
    }

    if (!attendance.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'Please check in first',
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today',
        data: attendance,
      });
    }

    // Update check-out time
    attendance.checkOutTime = new Date();
    attendance.calculateWorkingHours();
    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: attendance,
    });
  } catch (error) {
    console.error('Check Out Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during check-out',
      error: error.message,
    });
  }
};

// @desc    Get my attendance
// @route   GET /api/attendance/my
// @access  Private (Employee)
export const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month, year } = req.query;

    let filter = { userId: userId };

    // Filter by month and year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(filter).sort({ date: -1 });

    // Calculate statistics
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
    const absentDays = attendance.filter(a => a.status === 'Absent').length;
    const lateDays = attendance.filter(a => a.isLate).length;
    const totalHours = attendance.reduce((sum, a) => sum + (a.workingHours || 0), 0);

    res.status(200).json({
      success: true,
      data: attendance,
      statistics: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        totalHours: totalHours.toFixed(2),
        averageHours: totalDays > 0 ? (totalHours / totalDays).toFixed(2) : 0,
      },
    });
  } catch (error) {
    console.error('Get My Attendance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error.message,
    });
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private (HR/TL)
export const getAttendanceStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's stats
    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow },
    });

    const totalEmployees = await User.countDocuments({ isActive: true });
    const presentToday = todayAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
    const absentToday = totalEmployees - presentToday;
    const lateToday = todayAttendance.filter(a => a.isLate).length;

    // This month stats
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthAttendance = await Attendance.find({
      date: { $gte: firstDayOfMonth, $lt: tomorrow },
    });

    const avgWorkingHours = monthAttendance.length > 0
      ? (monthAttendance.reduce((sum, a) => sum + (a.workingHours || 0), 0) / monthAttendance.length).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        today: {
          totalEmployees,
          present: presentToday,
          absent: absentToday,
          late: lateToday,
          attendanceRate: ((presentToday / totalEmployees) * 100).toFixed(2) + '%',
        },
        thisMonth: {
          totalRecords: monthAttendance.length,
          averageWorkingHours: avgWorkingHours,
        },
      },
    });
  } catch (error) {
    console.error('Get Attendance Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};

// @desc    Create attendance record (manual entry)
// @route   POST /api/attendance
// @access  Private (Employee)
export const createAttendance = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { date, checkIn, checkOut, workingHours, status, remarks } = req.body;

    // Validate required fields
    if (!date || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Date, check-in, and check-out times are required',
      });
    }

    // Check if attendance already exists for this date
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    const nextDay = new Date(dateObj);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const existingAttendance = await Attendance.findOne({
      userId: userId,
      date: { $gte: dateObj, $lt: nextDay },
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this date',
      });
    }

    // Create new attendance record
    const attendance = await Attendance.create({
      userId: userId,
      employeeId: user.employeeId,
      employeeName: user.name,
      date: dateObj,
      checkInTime: new Date(checkIn),
      checkOutTime: new Date(checkOut),
      status: status || 'Present',
      workingHours: workingHours || 0,
      remarks: remarks || '',
    });

    console.log('✅ Attendance created:', attendance);

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance,
    });
  } catch (error) {
    console.error('Create Attendance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating attendance record',
      error: error.message,
    });
  }
};
