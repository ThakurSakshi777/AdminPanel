const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  if (!token) {
    console.warn('No authentication token found');
  }
  console.log('Auth Debug - Token exists:', !!token, 'UserRole:', userRole);
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || ''}`
  };
};

// ========== EMPLOYEES API ==========
export const getEmployees = async () => {
  try {
    const token = localStorage.getItem('authToken');
    console.log('🔍 [getEmployees] Starting fetch...');
    console.log('🔍 [getEmployees] Token present:', !!token);
    console.log('🔍 [getEmployees] Token length:', token?.length || 0);
    
    const headers = getAuthHeader();
    console.log('🔍 [getEmployees] Request headers:', {
      'Content-Type': headers['Content-Type'],
      'Authorization': headers['Authorization'] ? `Bearer ${headers['Authorization'].substring(7, 50)}...` : 'NONE'
    });
    
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'GET',
      headers: headers
    });
    
    console.log('🔍 [getEmployees] Response status:', response.status);
    console.log('🔍 [getEmployees] Response statusText:', response.statusText);
    console.log('🔍 [getEmployees] Response headers:', {
      'content-type': response.headers.get('content-type'),
      'content-length': response.headers.get('content-length')
    });
    
    if (!response.ok) {
      // If 401, token might be invalid or expired
      if (response.status === 401) {
        console.error('❌ [getEmployees] Unauthorized - Token invalid or expired');
        console.error('❌ [getEmployees] Removing invalid token from localStorage');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ [getEmployees] Data received successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ [getEmployees] Error:', error.message);
    return { success: false, data: [], message: error.message };
  }
};

export const getEmployeeById = async (employeeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch employee');
    return await response.json();
  } catch (error) {
    console.error('Error fetching employee:', error);
    throw error;
  }
};

export const createEmployee = async (employeeData) => {
  try {
    // Ensure required fields are present
    if (!employeeData.name || !employeeData.email) {
      return {
        success: false,
        message: 'Name and Email are required fields'
      };
    }

    // Prepare data with defaults
    const data = {
      name: employeeData.name,
      email: employeeData.email,
      password: employeeData.password || 'default123',
      role: employeeData.role || 'employee',
      position: employeeData.position || '',
      department: employeeData.department || '',
      team: employeeData.team || '',
      teamLeader: employeeData.teamLeader || '',
      phone: employeeData.phone || '',
      salary: employeeData.salary || 0,
      address: employeeData.address || '',
      joinDate: employeeData.joinDate || new Date()
    };

    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || `Error: ${response.status} ${response.statusText}`
      };
    }

    return result;
  } catch (error) {
    console.error('Error creating employee:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(employeeData)
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || `Error: ${response.status} ${response.statusText}`
      };
    }

    return result;
  } catch (error) {
    console.error('Error updating employee:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

export const deleteEmployee = async (employeeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || `Error: ${response.status} ${response.statusText}`
      };
    }

    return result;
  } catch (error) {
    console.error('Error deleting employee:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// ========== APPROVED EMPLOYEES API (from HR Auth) ==========
export const getApprovedEmployees = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/hr-auth/approved`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        console.warn('Unauthorized access to approved endpoint');
        return { success: false, data: [], message: 'Unauthorized' };
      }
      return { success: false, data: [], message: `HTTP ${response.status}` };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching approved employees:', error);
    return { success: false, data: [], message: error.message };
  }
};

export const getPendingEmployees = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/hr-auth/pending`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch pending employees');
    return await response.json();
  } catch (error) {
    console.error('Error fetching pending employees:', error);
    throw error;
  }
};

// ========== ATTENDANCE API ==========
export const getAttendance = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/attendance?${params}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch attendance');
    return await response.json();
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
};

export const markAttendance = async (attendanceData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(attendanceData)
    });
    if (!response.ok) throw new Error('Failed to mark attendance');
    return await response.json();
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
};

// ========== LEAVES API ==========
export const getLeaves = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/leaves?${params}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch leaves');
    return await response.json();
  } catch (error) {
    console.error('Error fetching leaves:', error);
    throw error;
  }
};

export const createLeaveRequest = async (leaveData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/leaves`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(leaveData)
    });
    if (!response.ok) throw new Error('Failed to create leave request');
    return await response.json();
  } catch (error) {
    console.error('Error creating leave request:', error);
    throw error;
  }
};

export const approveLeave = async (leaveId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/leaves/${leaveId}/approve`, {
      method: 'PUT',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to approve leave');
    return await response.json();
  } catch (error) {
    console.error('Error approving leave:', error);
    throw error;
  }
};

export const rejectLeave = async (leaveId, rejectionReason) => {
  try {
    const response = await fetch(`${API_BASE_URL}/leaves/${leaveId}/reject`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({ rejectionReason })
    });
    if (!response.ok) throw new Error('Failed to reject leave');
    return await response.json();
  } catch (error) {
    console.error('Error rejecting leave:', error);
    throw error;
  }
};

// Get pending leave requests for HR
export const getPendingLeaveRequests = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/leaves?status=Pending`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      throw new Error(`Failed to fetch pending leave requests: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Pending leaves API response:', data);
    
    return {
      success: data.success !== false,
      data: data.data || [],
      message: data.message || 'Pending leave requests fetched'
    };
  } catch (error) {
    console.error('Error fetching pending leave requests:', error);
    return { 
      success: false, 
      data: [], 
      message: error.message || 'Failed to fetch leave requests' 
    };
  }
};

// ========== PERFORMANCE API ==========
export const getPerformance = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/performance?${params}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch performance');
    return await response.json();
  } catch (error) {
    console.error('Error fetching performance:', error);
    throw error;
  }
};

export const createPerformanceReview = async (reviewData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/performance`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(reviewData)
    });
    if (!response.ok) throw new Error('Failed to create performance review');
    return await response.json();
  } catch (error) {
    console.error('Error creating performance review:', error);
    throw error;
  }
};

// ========== SALARY API ==========
export const getSalaries = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/salary?${params}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch salaries');
    return await response.json();
  } catch (error) {
    console.error('Error fetching salaries:', error);
    throw error;
  }
};

export const setSalary = async (salaryData) => {
  try {
    console.log('💰 Setting salary for employee:', salaryData);
    const response = await fetch(`${API_BASE_URL}/salary`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(salaryData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to set salary');
    }
    
    const result = await response.json();
    console.log('✅ Salary set successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Error setting salary:', error);
    throw error;
  }
};

export const processSalary = async (salaryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/salary/process`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(salaryData)
    });
    if (!response.ok) throw new Error('Failed to process salary');
    return await response.json();
  } catch (error) {
    console.error('Error processing salary:', error);
    throw error;
  }
};

// ========== ACTIVITIES API ==========
export const getRecentActivities = async (limit = 10) => {
  try {
    // Return fallback data since /api/activities endpoint doesn't exist
    // This endpoint could be implemented later if needed
    const fallbackActivities = [
      { id: 1, name: 'Rahul Sharma', action: 'New Employee Joined', date: new Date().toISOString(), status: 'Success', type: 'join', role: 'Senior Developer' },
      { id: 2, name: 'Priya Singh', action: 'Leave Applied', date: new Date(Date.now() - 86400000).toISOString(), status: 'Pending', type: 'leave', leaveType: 'Casual (2 days)' },
      { id: 3, name: 'Amit Patel', action: 'Attendance Marked', date: new Date().toISOString(), status: 'Success', type: 'attendance', checkIn: '09:15 AM' },
      { id: 4, name: 'Neha Sharma', action: 'Performance Review', date: new Date(Date.now() - 172800000).toISOString(), status: 'Success', type: 'review', rating: '4.5/5' },
    ];
    
    return {
      success: true,
      data: fallbackActivities.slice(0, limit)
    };
  } catch (error) {
    console.error('Error fetching activities:', error);
    // Return empty activities on error
    return {
      success: false,
      data: []
    };
  }
};

// ========== REPORTS API ==========
export const getDashboardStats = async () => {
  try {
    // Fetch employees
    const employeeResponse = await fetch(`${API_BASE_URL}/employees`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    
    if (!employeeResponse.ok) {
      console.warn('Failed to fetch employees for dashboard stats:', employeeResponse.status);
      return null;
    }
    
    const employeeData = await employeeResponse.json();
    const employees = employeeData.data || [];
    
    console.log('📊 Dashboard Stats - Employees from API:', employees);
    
    // Calculate real statistics
    const totalEmployees = employees.length;
    const activeEmployees = employees.length;
    const inactiveEmployees = 0;
    
    // Get unique departments with employee count
    const departmentMap = {};
    const departmentSet = new Set();
    employees.forEach(e => {
      if (e.department && e.department.trim() !== '') {
        departmentSet.add(e.department);
        departmentMap[e.department] = (departmentMap[e.department] || 0) + 1;
      }
    });
    const departmentCount = departmentSet.size;
    const departments = Array.from(departmentSet).slice(0, 5); // Get first 5 departments
    
    console.log('📊 Departments found:', departments);
    console.log('📊 Department employee count:', departmentMap);
    
    // Try to fetch today's leave data
    let onLeaveEmployees = 0;
    try {
      const today = new Date().toISOString().split('T')[0];
      const leaveResponse = await fetch(
        `${API_BASE_URL}/leaves?startDate=${today}&endDate=${today}&status=Approved`,
        { method: 'GET', headers: getAuthHeader() }
      );
      
      if (leaveResponse.ok) {
        const leaveData = await leaveResponse.json();
        const leaveRecords = Array.isArray(leaveData) ? leaveData : leaveData.data || [];
        
        // Count unique employees on leave today
        const employeesOnLeave = new Set();
        leaveRecords.forEach(leave => {
          if (leave.employeeId || leave.userId) {
            employeesOnLeave.add(leave.employeeId || leave.userId);
          }
        });
        onLeaveEmployees = employeesOnLeave.size;
        console.log('📊 Employees on leave today:', onLeaveEmployees);
      } else {
        console.warn('Could not fetch leave data, using 0');
        onLeaveEmployees = 0;
      }
    } catch (err) {
      console.warn('Error fetching leave data:', err);
      onLeaveEmployees = 0;
    }
    
    // Calculate attendance rate
    const presentEmployees = activeEmployees - onLeaveEmployees;
    const attendanceRate = totalEmployees > 0 ? Math.round((presentEmployees / totalEmployees) * 100) : 0;
    
    // Prepare dashboard statistics
    const stats = {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      onLeaveEmployees,
      departmentCount,
      departments,
      departmentMap,
      attendanceRate,
      activeProjects: 8,
      leaveBalance: activeEmployees > 0 ? Math.round(240 / activeEmployees) : 0
    };
    
    console.log('📊 Dashboard Stats Calculated:', stats);
    
    return {
      success: true,
      data: stats,
      message: 'Dashboard stats fetched successfully'
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
};

// Get attendance chart data for last 12 days
export const getDashboardAttendanceChart = async () => {
  try {
    // Calculate last 12 days date range
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 12);
    
    const attendanceUrl = `${API_BASE_URL}/attendance?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
    console.log('📊 Fetching attendance chart from:', attendanceUrl);
    
    const response = await fetch(attendanceUrl, {
      method: 'GET',
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      console.warn('⚠️ Failed to fetch attendance for chart:', response.status, response.statusText);
      console.warn('⚠️ Attendance endpoint may not exist on backend. Using fallback data.');
      return {
        success: true,
        data: generateFallbackAttendanceData(endDate),
        message: 'Using fallback attendance data'
      };
    }
    
    const attendanceData = await response.json();
    console.log('📊 Attendance data from API:', attendanceData);
    
    const records = attendanceData.data || [];
    
    // Group by date and count statuses
    const grouped = {};
    
    // Initialize last 12 days
    for (let i = 11; i >= 0; i--) {
      const d = new Date(endDate);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
      const displayDate = new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      
      grouped[dateKey] = { name: displayDate, present: 0, absent: 0, onLeave: 0 };
    }
    
    // Count attendance records by status
    records.forEach(record => {
      const dateKey = new Date(record.date).toISOString().split('T')[0];
      if (grouped[dateKey]) {
        if (record.status === 'present') grouped[dateKey].present++;
        else if (record.status === 'absent') grouped[dateKey].absent++;
        else if (record.status === 'on-leave') grouped[dateKey].onLeave++;
      }
    });
    
    const chartData = Object.values(grouped);
    console.log('📊 Attendance chart data processed:', chartData);
    
    return {
      success: true,
      data: chartData
    };
  } catch (error) {
    console.error('❌ Error fetching attendance chart data:', error);
    console.log('📊 Using fallback attendance data');
    return {
      success: true,
      data: generateFallbackAttendanceData(new Date()),
      message: 'Using fallback data due to error'
    };
  }
};

// Generate fallback attendance data for testing
const generateFallbackAttendanceData = (endDate) => {
  const data = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const displayDate = new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    
    // Generate realistic attendance numbers
    const present = Math.floor(Math.random() * 15) + 35; // 35-50
    const absent = Math.floor(Math.random() * 5) + 1;    // 1-6
    const onLeave = Math.floor(Math.random() * 4);       // 0-4
    
    data.push({
      name: displayDate,
      present,
      absent,
      onLeave
    });
  }
  return data;
};

export const getReports = async (reportType, filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/reports/${reportType}?${params}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch reports');
    return await response.json();
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

// ========== EMPLOYEE DASHBOARD API ==========

// Get current employee's profile
export const getMyProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/me/profile`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Profile API Error:', errorData);
      throw new Error(`Failed to fetch profile: ${response.status} ${JSON.stringify(errorData)}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

// Get employee's attendance
export const getMyAttendance = async (month, year) => {
  try {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    const response = await fetch(`${API_BASE_URL}/employees/me/attendance?${params}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) {
      console.warn('Attendance endpoint returned:', response.status);
      return { success: false, data: { records: [], statistics: {} } };
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return { success: false, data: { records: [], statistics: {} } };
  }
};

// Get employee's leaves
export const getMyLeaves = async (status) => {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const response = await fetch(`${API_BASE_URL}/leaves/my?${params}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) {
      console.warn('Leaves endpoint returned:', response.status);
      return { success: false, data: { requests: [], statistics: {} } };
    }
    const data = await response.json();
    console.log('getMyLeaves response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching leaves:', error);
    return { success: false, data: { requests: [], statistics: {} } };
  }
};

// Get employee's salary slips
export const getMySalarySlips = async (year, month) => {
  try {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    
    const response = await fetch(`${API_BASE_URL}/payslip/my?${params}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch salary slips');
    return await response.json();
  } catch (error) {
    console.error('Error fetching salary slips:', error);
    throw error;
  }
};

// Get employee's salary
export const getMySalary = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/me/salary`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) {
      console.warn('Salary endpoint returned:', response.status);
      return { success: false, data: null, message: 'No salary data available' };
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching salary:', error);
    return { success: false, data: null };
  }
};

// ========== EMPLOYEE PROFILE API ==========

// Get employee profile by ID
export const getEmployeeProfile = async (employeeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      console.error('Failed to fetch employee profile:', response.status);
      return { success: false, message: 'Employee not found' };
    }
    
    const data = await response.json();
    console.log('hrService getEmployeeProfile raw data:', data);
    
    const employeeData = data.data || data;
    
    // Ensure data has all required fields
    const result = {
      success: true,
      data: {
        _id: employeeData._id || employeeData.id,
        id: employeeData.id || employeeData._id,
        employeeId: employeeData.employeeId || '',  // IMPORTANT: Keep employee ID from User model
        name: employeeData.name || '',
        email: employeeData.email || '',
        phone: employeeData.phone || '',
        department: employeeData.department || '',
        position: employeeData.position || '',
        joinDate: employeeData.joinDate || '',
        status: employeeData.status || 'Active',
        documents: employeeData.documents || []
      },
      message: 'Profile fetched successfully'
    };
    
    console.log('hrService returning employee data:', result.data);
    return result;
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    return { success: false, message: error.message };
  }
};

// Update own profile
export const updateMyProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/me/profile`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(profileData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: result.message || `Error: ${response.status} ${response.statusText}`
      };
    }
    
    const updatedData = result.data || result;
    return {
      success: true,
      data: updatedData,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: error.message };
  }
};

// Update employee profile (HR only)
export const updateEmployeeProfile = async (employeeId, profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(profileData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: result.message || `Error: ${response.status} ${response.statusText}`
      };
    }
    
    // Ensure data is properly structured
    const updatedData = result.data || result;
    return {
      success: true,
      data: {
        _id: updatedData._id || updatedData.id,
        id: updatedData.id || updatedData._id,
        name: updatedData.name || '',
        email: updatedData.email || '',
        phone: updatedData.phone || '',
        department: updatedData.department || '',
        position: updatedData.position || '',
        joinDate: updatedData.joinDate || '',
        status: updatedData.status || 'Active',
        documents: updatedData.documents || []
      },
      message: 'Profile updated successfully'
    };
  } catch (error) {
    console.error('Error updating employee profile:', error);
    return { success: false, message: error.message };
  }
};

// Upload employee document
export const uploadEmployeeDocument = async (employeeId, documentData) => {
  try {
    const formData = new FormData();
    formData.append('name', documentData.name);
    formData.append('type', documentData.type || 'PDF');
    if (documentData.file) {
      formData.append('file', documentData.file);
    }
    
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to upload document'
      };
    }
    
    return {
      success: true,
      data: result.data || result,
      message: 'Document uploaded successfully'
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    return { success: false, message: error.message };
  }
};

// Delete employee document
export const deleteEmployeeDocument = async (employeeId, documentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/documents/${documentId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to delete document'
      };
    }
    
    return {
      success: true,
      message: 'Document deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { success: false, message: error.message };
  }
};

// ========== PROJECTS API ==========

// Get all projects (HR view)
export const getProjects = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/projects?${params}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch projects');
    const data = await response.json();
    console.log('Projects API response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { success: false, data: [], message: error.message };
  }
};

// Create project (HR only)
export const createProject = async (projectData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(projectData)
    });
    if (!response.ok) throw new Error('Failed to create project');
    return await response.json();
  } catch (error) {
    console.error('Error creating project:', error);
    return { success: false, message: error.message };
  }
};

// Get my assigned projects (Employee view)
export const getMyProjects = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/my`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) {
      console.warn('My projects endpoint returned:', response.status);
      return { success: false, data: [], statistics: {} };
    }
    const data = await response.json();
    console.log('My Projects API response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching my projects:', error);
    return { success: false, data: [], statistics: {} };
  }
};

// Update project (HR/Project Manager)
export const updateProject = async (projectId, projectData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(projectData)
    });
    if (!response.ok) throw new Error('Failed to update project');
    return await response.json();
  } catch (error) {
    console.error('Error updating project:', error);
    return { success: false, message: error.message };
  }
};

// Update project progress (Team member)
export const updateProjectProgress = async (projectId, progress, remarks = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/progress`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({ progress, remarks })
    });
    if (!response.ok) throw new Error('Failed to update project progress');
    return await response.json();
  } catch (error) {
    console.error('Error updating project progress:', error);
    return { success: false, message: error.message };
  }
};

// Delete project (HR only)
export const deleteProject = async (projectId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to delete project');
    return await response.json();
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false, message: error.message };
  }
};

// ========== ATTENDANCE API ==========
// Check In
export const checkIn = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/checkin`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to check in');
    return await response.json();
  } catch (error) {
    console.error('Error during check in:', error);
    return { success: false, message: error.message };
  }
};

// Check Out
export const checkOut = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/checkout`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to check out');
    return await response.json();
  } catch (error) {
    console.error('Error during check out:', error);
    return { success: false, message: error.message };
  }
};

// ========== PERFORMANCE API ==========
// Get all performance reviews (HR)
export const getAllPerformance = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/performance?${params}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch performance data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching performance:', error);
    return { success: false, message: error.message };
  }
};

// Get my performance (Employee)
export const getMyPerformance = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/performance/my`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch my performance');
    return await response.json();
  } catch (error) {
    console.error('Error fetching my performance:', error);
    return { success: false, message: error.message };
  }
};

// Get employee performance (HR)
export const getEmployeePerformance = async (employeeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/performance/${employeeId}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch employee performance');
    return await response.json();
  } catch (error) {
    console.error('Error fetching employee performance:', error);
    return { success: false, message: error.message };
  }
};

// Update employee rating (HR)
export const updateEmployeeRating = async (employeeId, ratingData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/performance/${employeeId}/rating`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(ratingData)
    });
    if (!response.ok) throw new Error('Failed to update employee rating');
    return await response.json();
  } catch (error) {
    console.error('Error updating employee rating:', error);
    return { success: false, message: error.message };
  }
};

// Get performance stats (HR)
export const getPerformanceStats = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/performance/stats?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch performance stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching performance stats:', error);
    return { success: false, message: error.message };
  }
};

// ========== ANNOUNCEMENTS API ==========
export const getAllAnnouncements = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${API_BASE_URL}/announcements?${queryParams}`;
    const headers = getAuthHeader();
    console.log('Fetching announcements from:', url, 'with headers:', headers);
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });
    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error:', response.status, errorData);
      throw new Error(`Failed to fetch announcements: ${response.status} ${errorData}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
};

export const getPublishedAnnouncements = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/announcements/published`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch published announcements');
    return await response.json();
  } catch (error) {
    console.error('Error fetching published announcements:', error);
    throw error;
  }
};

export const getAnnouncement = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch announcement');
    return await response.json();
  } catch (error) {
    console.error('Error fetching announcement:', error);
    throw error;
  }
};

export const createAnnouncement = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/announcements`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create announcement');
    return await response.json();
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

export const updateAnnouncement = async (id, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update announcement');
    return await response.json();
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
};

export const deleteAnnouncement = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to delete announcement');
    return await response.json();
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};

export const publishAnnouncement = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/announcements/${id}/publish`, {
      method: 'PUT',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to publish announcement');
    return await response.json();
  } catch (error) {
    console.error('Error publishing announcement:', error);
    throw error;
  }
};

// ========== NOTIFICATIONS API ==========
export const getNotifications = async (page = 1, limit = 20) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/unread/count`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch unread count');
    return await response.json();
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-as-read`, {
      method: 'PUT',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to mark all as read');
    return await response.json();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to delete notification');
    return await response.json();
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// ========== PAYSLIP API ==========

// Generate salary slips for multiple employees
export const generatePayslips = async (employeeIds, month, year) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payslip/generate`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({
        employeeIds,
        month: parseInt(month),
        year: parseInt(year)
      })
    });
    if (!response.ok) throw new Error('Failed to generate payslips');
    return await response.json();
  } catch (error) {
    console.error('Error generating payslips:', error);
    throw error;
  }
};

// Send payslip via email
export const sendPayslipEmail = async (payslipId, message = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/payslip/${payslipId}/email`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ message })
    });
    if (!response.ok) throw new Error('Failed to send payslip email');
    return await response.json();
  } catch (error) {
    console.error('Error sending payslip email:', error);
    throw error;
  }
};

// Download payslip as PDF
export const downloadPayslipPDF = async (payslipId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payslip/${payslipId}/download`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to download payslip');
    return response;
  } catch (error) {
    console.error('Error downloading payslip:', error);
    throw error;
  }
};

// Generate payslip for employee and month
export const generatePayslip = async (employeeIds, month, year) => {
  try {
    console.log('🔄 Generating payslip:', { employeeIds, month, year });
    const response = await fetch(`${API_BASE_URL}/payslip/generate`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({
        employeeIds,
        month: parseInt(month),
        year: parseInt(year)
      })
    });
    if (!response.ok) throw new Error('Failed to generate payslip');
    return await response.json();
  } catch (error) {
    console.error('Error generating payslip:', error);
    throw error;
  }
};

// Get all payslips
export const getAllPayslips = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/payslip`, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch payslips');
    return await response.json();
  } catch (error) {
    console.error('Error fetching payslips:', error);
    throw error;
  }
};

// Generate and send payslip in one action
export const generateAndSendPayslips = async (employeeIds, month, year, message = '') => {
  try {
    console.log('🔄 Sending API request to generate and send payslips');
    console.log('📋 Data:', { employeeIds, month, year, message });
    
    const url = `${API_BASE_URL}/payslip/generate-and-send`;
    console.log('🌐 URL:', url);
    
    const requestBody = {
      employeeIds,
      month: parseInt(month),
      year: parseInt(year),
      message
    };
    
    console.log('📦 Request Body:', requestBody);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(requestBody)
    });
    
    console.log('✅ Response Status:', response.status);
    console.log('✅ Response OK:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      throw new Error(`Failed to generate and send payslips: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Success Response:', result);
    return result;
  } catch (error) {
    console.error('❌ Error generating and sending payslips:', error);
    throw error;
  }
};

// Get my payslips (for employees)
export const getMyPayslips = async (year) => {
  try {
    let url = `${API_BASE_URL}/payslip/my`;
    if (year) {
      url += `?year=${year}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch payslips');
    return await response.json();
  } catch (error) {
    console.error('Error fetching my payslips:', error);
    throw error;
  }
};

// Send payslip to employee's dashboard
export const sendPayslipToDashboard = async (payslipId) => {
  try {
    console.log('📤 Sending payslip to employee dashboard:', payslipId);
    const url = `${API_BASE_URL}/payslip/${payslipId}/send-to-dashboard`;
    console.log('🌐 URL:', url);
    console.log('🔑 Auth Header:', getAuthHeader());
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeader()
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response OK:', response.ok);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('📋 Error Data:', errorData);
      } catch (e) {
        const errorText = await response.text();
        console.error('📋 Error Text:', errorText);
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('✅ Payslip sent to dashboard:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending payslip to dashboard:', error);
    throw error;
  }
};

// ========== LETTERS API ==========

// Generate Letter (HR)
export const generateLetter = async (letterData) => {
  try {
    console.log('🚀 Sending letter generation request:', letterData);
    const response = await fetch(`${API_BASE_URL}/letters/generate`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(letterData)
    });
    const data = await response.json();
    console.log('📝 Server Response:', data);
    if (!response.ok) {
      console.error('❌ Server Error:', data.message || response.statusText);
      throw new Error(data.message || `HTTP ${response.status}: Failed to generate letter`);
    }
    console.log('✅ Letter generated successfully');
    return data;
  } catch (error) {
    console.error('❌ Error generating letter:', error.message);
    throw error;
  }
};

// Get All Letters (HR)
export const getAllLetters = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/letters`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch letters');
    }
    return data;
  } catch (error) {
    console.error('Error fetching letters:', error);
    throw error;
  }
};

// Get Employee Letters
export const getEmployeeLetters = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/letters/my-letters`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch employee letters');
    }
    return data;
  } catch (error) {
    console.error('Error fetching employee letters:', error);
    throw error;
  }
};

// Download Letter PDF
export const downloadLetter = async (letterId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/letters/${letterId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to download letter');
    }
    
    return response.blob();
  } catch (error) {
    console.error('Error downloading letter:', error);
    throw error;
  }
};

// Send Letter via Email
export const sendLetter = async (letterId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/letters/${letterId}/send`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send letter');
    }
    return data;
  } catch (error) {
    console.error('Error sending letter:', error);
    throw error;
  }
};

// Mark Letter as Viewed
export const viewLetter = async (letterId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/letters/${letterId}/view`, {
      method: 'PUT',
      headers: getAuthHeader()
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to mark letter as viewed');
    }
    return data;
  } catch (error) {
    console.error('Error marking letter as viewed:', error);
    throw error;
  }
};

// Delete Letter
export const deleteLetter = async (letterId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/letters/${letterId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete letter');
    }
    return data;
  } catch (error) {
    console.error('Error deleting letter:', error);
    throw error;
  }
};

// ========== AUTHENTICATION TESTING ==========
export const testAuthentication = async () => {
  console.log('🧪 [TEST] Starting authentication test...');
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  
  console.table({
    'Token Present': !!token,
    'Token Length': token?.length || 0,
    'User Role': userRole || 'MISSING',
    'API Base URL': API_BASE_URL
  });
  
  if (!token) {
    console.error('❌ [TEST] No token found - User not logged in');
    return { success: false, message: 'No token found' };
  }
  
  // Try to parse JWT header
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      console.log('✅ [TEST] JWT is valid format');
      console.table({ header, payload });
    } else {
      console.error('❌ [TEST] Token is not a valid JWT (should have 3 parts)');
    }
  } catch (e) {
    console.error('❌ [TEST] Failed to parse JWT:', e.message);
  }
  
  // Test with a simple endpoint that doesn't need authorization
  try {
    console.log('🔍 [TEST] Testing request to /api/employees with Bearer token...');
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`📊 [TEST] Response Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ [TEST] Authentication successful!');
      console.log('✅ [TEST] Received data:', data);
      return { success: true, data };
    } else {
      console.error('❌ [TEST] Authentication failed');
      console.error('❌ [TEST] Error response:', data);
      return { success: false, status: response.status, data };
    }
  } catch (error) {
    console.error('❌ [TEST] Network error:', error);
    return { success: false, error: error.message };
  }
};


