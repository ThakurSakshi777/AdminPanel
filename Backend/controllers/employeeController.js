import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payslip from '../models/Payslip.js';
import Performance from '../models/Performance.js';
import Salary from '../models/Salary.js';

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (HR/TL)
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({}).sort({ createdAt: -1 });

    // Populate name from User model if missing and attach salary data
    const enrichedEmployees = await Promise.all(
      employees.map(async (emp) => {
        const empObj = emp.toObject();
        if (!empObj.name && empObj.userId) {
          const user = await User.findById(empObj.userId);
          if (user) {
            empObj.name = user.name;
          }
        }
        
        // Fetch salary data for this employee
        try {
          const salary = await Salary.findOne({ userId: empObj.userId, isActive: true });
          if (salary) {
            empObj.salary = salary.basicSalary;
            empObj.salaryData = salary; // Include full salary object
          }
        } catch (err) {
          console.log(`Salary not found for employee ${empObj._id}`);
        }
        
        return empObj;
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedEmployees.length,
      data: enrichedEmployees,
    });
  } catch (error) {
    console.error('Get All Employees Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employees',
      error: error.message,
    });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error('Get Employee Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee',
      error: error.message,
    });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (HR only)
export const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      employeeId,
      position,
      department,
      team,
      teamLeader,
      phone,
      salary,
      address,
      emergencyContact,
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Check if employeeId already exists (if provided)
    if (employeeId) {
      const idExists = await User.findOne({ employeeId });
      if (idExists) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists',
        });
      }
    }

    // Create user first
    const user = await User.create({
      name,
      email,
      password: password || 'default123',
      role: role || 'employee',
      employeeId: employeeId || undefined, // Let schema auto-generate if not provided
      department,
      position,
      phone,
    });

    // Create employee record
    const employee = await Employee.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      employeeId: user.employeeId,
      role: user.role,
      position: position || '',
      department: department || '',
      team: team || '',
      teamLeader: teamLeader || '',
      phone: phone || '',
      salary: salary || 0,
      address: address || '',
      emergencyContact: emergencyContact || {},
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    console.error('Create Employee Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating employee',
      error: error.message,
    });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (HR only)
export const updateEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      employeeId,
      position,
      department,
      team,
      teamLeader,
      phone,
      salary,
      status,
      address,
      emergencyContact,
      // Personal Information
      fatherMotherName,
      dateOfBirth,
      gender,
      currentAddress,
      permanentAddress,
      // Job Information
      workLocation,
      employmentType,
      // Salary & Bank Information
      bankName,
      bankAccountNumber,
      ifscCode,
      paymentMode,
      basicSalary,
      ctc,
      // Compliance IDs
      panNumber,
      aadharNumber,
      uan,
      esicNumber,
      pfNumber,
      joinDate,
    } = req.body;

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Check if new employeeId is unique (if changed)
    if (employeeId && employeeId !== employee.employeeId) {
      const idExists = await User.findOne({ employeeId });
      if (idExists) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists',
        });
      }
    }

    // Update employee fields
    if (name) employee.name = name;
    if (email) employee.email = email;
    if (role) employee.role = role;
    if (employeeId) employee.employeeId = employeeId;
    if (position) employee.position = position;
    if (department) employee.department = department;
    if (team) employee.team = team;
    if (teamLeader) employee.teamLeader = teamLeader;
    if (phone) employee.phone = phone;
    if (salary !== undefined) employee.salary = salary;
    if (status) employee.status = status;
    if (address) employee.address = address;
    if (emergencyContact) employee.emergencyContact = emergencyContact;
    if (joinDate) employee.joinDate = joinDate;

    // Personal Information Fields
    if (fatherMotherName) employee.fatherMotherName = fatherMotherName;
    if (dateOfBirth) employee.dateOfBirth = dateOfBirth;
    if (gender) employee.gender = gender;
    if (currentAddress) employee.currentAddress = currentAddress;
    if (permanentAddress) employee.permanentAddress = permanentAddress;

    // Job Information Fields
    if (workLocation) employee.workLocation = workLocation;
    if (employmentType) employee.employmentType = employmentType;

    // Salary & Bank Information Fields
    if (bankName) employee.bankName = bankName;
    if (bankAccountNumber) employee.bankAccountNumber = bankAccountNumber;
    if (ifscCode) employee.ifscCode = ifscCode;
    if (paymentMode) employee.paymentMode = paymentMode;
    if (basicSalary !== undefined) employee.basicSalary = basicSalary;
    if (ctc !== undefined) employee.ctc = ctc;

    // Compliance ID Fields
    if (panNumber) employee.panNumber = panNumber;
    if (aadharNumber) employee.aadharNumber = aadharNumber;
    if (uan) employee.uan = uan;
    if (esicNumber) employee.esicNumber = esicNumber;
    if (pfNumber) employee.pfNumber = pfNumber;

    await employee.save();

    // Also update user record with basic fields
    if (employee.userId) {
      await User.findByIdAndUpdate(employee.userId, {
        name: employee.name,
        email: employee.email,
        role: employee.role,
        employeeId: employeeId || employee.employeeId,
        department: employee.department,
        position: employee.position,
        phone: employee.phone,
        joinDate: employee.joinDate,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    console.error('Update Employee Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employee',
      error: error.message,
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (HR only)
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Hard delete - remove from database
    await Employee.findByIdAndDelete(req.params.id);

    // Also delete user account if exists
    if (employee.userId) {
      await User.findByIdAndDelete(employee.userId);
    }

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    console.error('Delete Employee Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting employee',
      error: error.message,
    });
  }
};

// @desc    Get employees by department
// @route   GET /api/employees/department/:department
// @access  Private
export const getEmployeesByDepartment = async (req, res) => {
  try {
    const employees = await Employee.find({
      department: req.params.department,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error('Get Employees By Department Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employees',
      error: error.message,
    });
  }
};

// @desc    Get employees statistics
// @route   GET /api/employees/stats
// @access  Private (HR)
export const getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ isActive: true });
    const activeEmployees = await Employee.countDocuments({
      status: 'Active',
      isActive: true,
    });
    const onLeave = await Employee.countDocuments({
      status: 'On Leave',
      isActive: true,
    });

    // Count by department
    const departments = await Employee.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);

    // Count by role
    const roles = await Employee.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        onLeave,
        inactive: totalEmployees - activeEmployees - onLeave,
        departments,
        roles,
      },
    });
  } catch (error) {
    console.error('Get Employee Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};

// ========== EMPLOYEE DASHBOARD ENDPOINTS ==========

// @desc    Get current employee's profile data
// @route   GET /api/employees/me/profile
// @access  Private (Employee)
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role,
        department: user.department,
        position: user.position,
        phone: user.phone,
        joinDate: user.joinDate,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Get My Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};

// @desc    Update current user's profile
// @route   PUT /api/employees/me/profile
// @access  Private (Employee)
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, phone, department, position, role, employeeId, joinDate } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (department) user.department = department;
    if (position) user.position = position;
    if (role) user.role = role;
    if (employeeId) user.employeeId = employeeId;
    if (joinDate) user.joinDate = new Date(joinDate);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role,
        department: user.department,
        position: user.position,
        phone: user.phone,
        joinDate: user.joinDate,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Update My Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

// @desc    Get current employee's attendance
// @route   GET /api/employees/me/attendance
// @access  Private (Employee)
export const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const { month, year } = req.query;
    let filter = { userId: userId };

    // Filter by month and year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    // Import Attendance model
    const attendance = await Attendance.find(filter)
      .sort({ date: -1 })
      .limit(100);

    // Calculate statistics
    const totalRecords = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const absentDays = attendance.filter(a => a.status === 'Absent').length;
    const lateDays = attendance.filter(a => a.isLate).length;
    const attendancePercentage = totalRecords > 0 ? Math.round((presentDays / totalRecords) * 100) : 0;

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
      statistics: {
        total: totalRecords,
        present: presentDays,
        absent: absentDays,
        late: lateDays,
        attendancePercentage,
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

// @desc    Get current employee's leaves
// @route   GET /api/employees/me/leaves
// @access  Private (Employee)
export const getMyLeaves = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const { status } = req.query;
    let filter = { userId: userId };

    if (status) {
      filter.status = status;
    }

    const leaves = await Leave.find(filter)
      .sort({ appliedDate: -1 })
      .limit(100);

    // Calculate statistics
    const totalLeaves = leaves.length;
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;
    const rejectedLeaves = leaves.filter(l => l.status === 'Rejected').length;

    // Calculate leave balance (assuming 20 annual leaves)
    const leavesTaken = approvedLeaves;
    const leaveBalance = Math.max(0, 20 - leavesTaken);

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
      statistics: {
        total: totalLeaves,
        pending: pendingLeaves,
        approved: approvedLeaves,
        rejected: rejectedLeaves,
        leavesTaken,
        leaveBalance,
      },
    });
  } catch (error) {
    console.error('Get My Leaves Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaves',
      error: error.message,
    });
  }
};

// @desc    Get current employee's salary slips
// @route   GET /api/employees/me/salary/slips
// @access  Private (Employee)
export const getMySalarySlips = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const { year, month } = req.query;
    let filter = { userId: userId };

    if (year) {
      filter.year = parseInt(year);
    }

    if (month) {
      filter.month = parseInt(month);
    }

    const payslips = await Payslip.find(filter)
      .sort({ generatedDate: -1 })
      .limit(24); // Last 24 months

    res.status(200).json({
      success: true,
      count: payslips.length,
      data: payslips,
    });
  } catch (error) {
    console.error('Get My Salary Slips Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching salary slips',
      error: error.message,
    });
  }
};

// @desc    Get current employee's performance
// @route   GET /api/employees/me/performance
// @access  Private (Employee)
export const getMyPerformance = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const { month, year } = req.query;
    const currentDate = new Date();
    const filterMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const filterYear = year ? parseInt(year) : currentDate.getFullYear();

    const performance = await Performance.findOne({
      userId: userId,
      'reviewPeriod.month': filterMonth,
      'reviewPeriod.year': filterYear,
    }).populate('reviewedBy', 'name email');

    if (!performance) {
      return res.status(404).json({
        success: false,
        message: 'No performance review found for this period',
        data: null,
      });
    }

    // Transform performance data to match frontend expectations
    const transformedData = {
      _id: performance._id,
      overallRating: performance.rating || 0,
      attendance: parseInt(performance.attendanceRate) || 0,
      productivity: Math.round((performance.taskCompletionRate || 0) * 100 / 100) || 0,
      teamwork: 80, // Default value if not in schema
      communication: 85, // Default value if not in schema
      reviews: performance.achievements && performance.achievements.length > 0 
        ? performance.achievements.map((ach, idx) => ({
            quarter: `Q${Math.floor((performance.reviewPeriod.month - 1) / 3) + 1} ${performance.reviewPeriod.year}`,
            rating: performance.rating || 0,
            feedback: ach.description || ach.title,
          }))
        : [{
            quarter: `Q${Math.floor((performance.reviewPeriod.month - 1) / 3) + 1} ${performance.reviewPeriod.year}`,
            rating: performance.rating || 0,
            feedback: performance.feedback || 'No feedback available',
          }],
      feedback: performance.feedback,
      strengths: performance.strengths,
      areasForImprovement: performance.areasForImprovement,
      rawData: performance, // Include raw data for reference
    };

    res.status(200).json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    console.error('Get My Performance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching performance',
      error: error.message,
    });
  }
};

// @desc    Get current employee's salary
// @route   GET /api/employees/me/salary
// @access  Private (Employee)
export const getMySalary = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const salary = await Salary.findOne({
      userId: userId,
      isActive: true,
    });

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'No active salary record found',
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: salary,
    });
  } catch (error) {
    console.error('Get My Salary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching salary',
      error: error.message,
    });
  }
};
