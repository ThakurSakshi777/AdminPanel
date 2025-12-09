import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, TrendingUp, DollarSign, Bell, User, LogOut, Menu, X, Download, FolderOpen, Briefcase, LogIn, FileText } from 'lucide-react';
import { getMyProfile, getMyAttendance, getMyLeaves, getMySalarySlips, getMyPerformance, getMySalary, checkIn, checkOut } from '../services/hrService';
import EmployeeSidebar from '../components/EmployeeSidebar';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  // State for API data
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [leaveData, setLeaveData] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [salarySlips, setSalarySlips] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [error, setError] = useState(null);
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [checkOutStatus, setCheckOutStatus] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Recent announcements (static)
  const announcements = [
    { id: 1, title: 'Diwali Holidays Announced', date: '2 days ago', icon: '📢' },
    { id: 2, title: 'New Office Policy', date: '5 days ago', icon: '📋' },
    { id: 3, title: 'Performance Review Schedule', date: '1 week ago', icon: '⭐' },
  ];

  // Calculate attendance statistics from records
  const calculateAttendanceStats = (records) => {
    if (!records || records.length === 0) {
      return {
        present: 0,
        absent: 0,
        leaves: 0,
        attendancePercentage: 0,
        totalWorkingDays: 0
      };
    }

    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;

    records.forEach(record => {
      const status = record.status?.toLowerCase() || '';
      if (status === 'present' || status === 'late') {
        presentCount++;
      } else if (status === 'absent') {
        absentCount++;
      } else if (status === 'leave' || status === 'on leave') {
        leaveCount++;
      }
    });

    const totalDays = records.length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

    console.log('📊 Attendance Stats Calculated:', {
      presentCount,
      absentCount,
      leaveCount,
      totalDays,
      attendancePercentage
    });

    return {
      present: presentCount,
      absent: absentCount,
      leaves: leaveCount,
      attendancePercentage: attendancePercentage,
      totalWorkingDays: totalDays
    };
  };

  // Calculate leave statistics from leave requests
  const calculateLeaveStats = (leaveRequests) => {
    if (!leaveRequests || leaveRequests.length === 0) {
      return {
        approved: 0,
        pending: 0,
        rejected: 0,
        totalDaysTaken: 0,
        casualLeave: { available: 12, total: 12 },
        sickLeave: { available: 8, total: 8 },
        earnedLeave: { available: 20, total: 20 }
      };
    }

    // Calculate by leave type
    const leavesByType = {};
    let totalDaysTaken = 0;

    leaveRequests.forEach(leave => {
      const type = leave.leaveType?.toLowerCase() || 'casual';
      if (leave.status === 'Approved') {
        totalDaysTaken += leave.totalDays || 1;
        if (!leavesByType[type]) {
          leavesByType[type] = 0;
        }
        leavesByType[type] += leave.totalDays || 1;
      }
    });

    // Default leave balance (you can adjust these based on your policy)
    const defaultBalance = {
      casual: { total: 12, used: leavesByType['casual leave'] || leavesByType['casual'] || 0 },
      sick: { total: 8, used: leavesByType['sick leave'] || leavesByType['sick'] || 0 },
      earned: { total: 20, used: leavesByType['earned leave'] || leavesByType['earned'] || 0 }
    };

    console.log('📋 Leave Stats Calculated:', {
      totalDaysTaken,
      leavesByType,
      defaultBalance
    });

    return {
      approved: leaveRequests.filter(l => l.status === 'Approved').length,
      pending: leaveRequests.filter(l => l.status === 'Pending').length,
      rejected: leaveRequests.filter(l => l.status === 'Rejected').length,
      totalDaysTaken: totalDaysTaken,
      casualLeave: { available: defaultBalance.casual.total - defaultBalance.casual.used, total: defaultBalance.casual.total },
      sickLeave: { available: defaultBalance.sick.total - defaultBalance.sick.used, total: defaultBalance.sick.total },
      earnedLeave: { available: defaultBalance.earned.total - defaultBalance.earned.used, total: defaultBalance.earned.total }
    };
  };

  // Calculate salary with leave deduction
  const calculateSalaryWithLeaveDeduction = (baseSalaryData, totalLeaveDays) => {
    if (!baseSalaryData) {
      return {
        baseSalary: 0,
        calculatedSalary: 0,
        leaveDeduction: 0,
        finalSalary: 0,
        perDayRate: 0,
        month: 'N/A'
      };
    }

    // Get basic salary components
    const grossSalary = baseSalaryData.grossSalary || baseSalaryData.basicSalary || 0;
    const netSalary = baseSalaryData.netSalary || grossSalary;
    
    // Assuming 22 working days in a month (standard)
    const workingDaysInMonth = 22;
    const perDayRate = netSalary / workingDaysInMonth;
    const leaveDeduction = perDayRate * totalLeaveDays;
    const calculatedSalary = netSalary - leaveDeduction;

    // Get current month name
    const currentDate = new Date();
    const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    console.log('💰 Salary Calculated:', {
      grossSalary,
      netSalary,
      workingDaysInMonth,
      perDayRate,
      totalLeaveDays,
      leaveDeduction,
      calculatedSalary,
      monthName
    });

    return {
      baseSalary: netSalary,
      calculatedSalary: Math.round(calculatedSalary),
      leaveDeduction: Math.round(leaveDeduction),
      finalSalary: Math.round(calculatedSalary),
      perDayRate: Math.round(perDayRate),
      month: monthName,
      totalLeaveDays: totalLeaveDays,
      workingDays: workingDaysInMonth
    };
  };

  // Calculate performance rating
  const calculatePerformanceRating = (perfData) => {
    if (!perfData) {
      return {
        overallRating: 0,
        attendance: 0,
        productivity: 0,
        teamwork: 0,
        communication: 0,
        reviews: [],
        ratingLabel: 'No Data'
      };
    }

    // Backend returns performance (0-100 score) and rating (1-5)
    const performanceScore = perfData.performance || perfData.rating * 20 || 0;
    const ratingScale = perfData.rating || (performanceScore / 20).toFixed(1) || 0;
    
    // Calculate individual metrics (use provided values or derive from performance)
    const attendance = perfData.attendance || 0;
    const productivity = perfData.tasksCompletionRate || 0;
    const teamwork = perfData.activeProjects ? Math.min((perfData.activeProjects / 5) * 100, 100) : 0;
    const communication = perfData.performance ? Math.max(performanceScore - 10, 0) : 0;

    // Determine rating label
    let ratingLabel = 'Poor';
    if (ratingScale >= 4.5) ratingLabel = 'Excellent';
    else if (ratingScale >= 4) ratingLabel = 'Very Good';
    else if (ratingScale >= 3) ratingLabel = 'Good';
    else if (ratingScale >= 2) ratingLabel = 'Average';

    console.log('⭐ Performance Rating Calculated:', {
      overallRating: ratingScale,
      performanceScore,
      attendance,
      productivity,
      teamwork,
      communication,
      ratingLabel
    });

    return {
      overallRating: parseFloat(ratingScale).toFixed(1),
      attendance: Math.round(attendance),
      productivity: Math.round(productivity),
      teamwork: Math.round(teamwork),
      communication: Math.round(Math.min(communication, 100)),
      reviews: perfData.reviews || [],
      ratingLabel: ratingLabel
    };
  };

  // Fetch all employee dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Starting dashboard data fetch...');

        // Fetch profile
        try {
          console.log('Fetching profile...');
          const profileRes = await getMyProfile();
          console.log('Profile response:', profileRes);
          if (profileRes.success) {
            setEmployeeData(profileRes.data);
          } else {
            console.warn('Profile fetch failed:', profileRes.message);
          }
        } catch (err) {
          console.error('Profile error:', err);
        }

        // Fetch attendance
        try {
          console.log('Fetching attendance...');
          const attendanceRes = await getMyAttendance();
          console.log('Attendance response:', attendanceRes);
          if (attendanceRes.success) {
            // Handle both array data and object with statistics
            setAttendanceSummary(attendanceRes.statistics || {});
            // The API returns attendance as an array directly
            setAttendanceRecords(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
            console.log('✅ Attendance records set:', Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
          }
        } catch (err) {
          console.error('Attendance error:', err);
        }

        // Fetch leaves
        try {
          console.log('Fetching leaves...');
          const leaveRes = await getMyLeaves();
          console.log('Leave response:', leaveRes);
          if (leaveRes.success) {
            // The API returns leaves as an array in data
            setLeaveData(Array.isArray(leaveRes.data) ? leaveRes.data : leaveRes.data || []);
            console.log('✅ Leave data set:', Array.isArray(leaveRes.data) ? leaveRes.data : leaveRes.data || []);
          }
        } catch (err) {
          console.error('Leave error:', err);
        }

        // Fetch salary
        try {
          console.log('Fetching salary...');
          const salaryRes = await getMySalary();
          console.log('Salary response:', salaryRes);
          if (salaryRes.success && salaryRes.data) {
            setSalaryData(salaryRes.data);
          }
        } catch (err) {
          console.error('Salary error:', err);
        }

        // Fetch performance
        try {
          console.log('Fetching performance...');
          const perfRes = await getMyPerformance();
          console.log('Performance response:', perfRes);
          if (perfRes.success && perfRes.data) {
            setPerformanceData(perfRes.data);
          }
        } catch (err) {
          console.error('Performance error:', err);
        }

        // Fetch salary slips
        try {
          console.log('Fetching salary slips...');
          const currentYear = new Date().getFullYear();
          const slipsRes = await getMySalarySlips(currentYear);
          console.log('Salary slips response:', slipsRes);
          if (slipsRes.success && slipsRes.data) {
            const slips = Array.isArray(slipsRes.data) ? slipsRes.data : [];
            setSalarySlips(slips.sort((a, b) => b.month - a.month).slice(0, 12));
          }
        } catch (err) {
          console.error('Salary slips error:', err);
        }

        console.log('Dashboard data fetch completed');
      } catch (err) {
        console.error('General error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please ensure you are logged in and the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Add a refresh function to manually refresh attendance data
  const refreshAttendanceData = async () => {
    try {
      console.log('🔄 Manually refreshing attendance data...');
      const attendanceRes = await getMyAttendance();
      console.log('Refreshed attendance response:', attendanceRes);
      if (attendanceRes.success) {
        setAttendanceSummary(attendanceRes.statistics || {});
        setAttendanceRecords(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
        console.log('✅ Attendance data refreshed successfully');
      } else {
        console.warn('Failed to refresh attendance');
      }
    } catch (err) {
      console.error('Error refreshing attendance:', err);
    }
  };

  const handleCheckIn = async () => {
    try {
      setAttendanceLoading(true);
      const res = await checkIn();
      if (res.success) {
        setCheckInStatus('success');
        alert('Check-in successful!');
        // Refresh attendance data
        const attendanceRes = await getMyAttendance();
        if (attendanceRes.success) {
          setAttendanceSummary(attendanceRes.statistics || {});
          setAttendanceRecords(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
        }
      } else {
        setCheckInStatus('error');
        alert('Check-in failed: ' + (res.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setCheckInStatus('error');
      alert('Error during check-in');
    } finally {
      setAttendanceLoading(false);
      setTimeout(() => setCheckInStatus(null), 3000);
    }
  };

  const handleCheckOut = async () => {
    try {
      setAttendanceLoading(true);
      const res = await checkOut();
      if (res.success) {
        setCheckOutStatus('success');
        alert('Check-out successful!');
        // Refresh attendance data
        const attendanceRes = await getMyAttendance();
        if (attendanceRes.success) {
          setAttendanceSummary(attendanceRes.statistics || {});
          setAttendanceRecords(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
        }
      } else {
        setCheckOutStatus('error');
        alert('Check-out failed: ' + (res.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Check-out error:', err);
      setCheckOutStatus('error');
      alert('Error during check-out');
    } finally {
      setAttendanceLoading(false);
      setTimeout(() => setCheckOutStatus(null), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Show loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px' }}>
        Loading dashboard...
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px',
        color: '#d32f2f'
      }}>
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <p style={{ fontSize: '12px', color: '#666' }}>
          Check browser console for more details. 
          Make sure you are logged in and the backend server is running on port 5000.
        </p>
      </div>
    );
  }

  // Prepare display data with fallbacks
  const displayEmployee = employeeData || {
    name: 'Employee',
    email: 'user@example.com',
    avatar: 'E',
    department: 'Department',
    jobTitle: 'Job Title'
  };

  // Calculate stats from attendance records
  const attendanceStats = calculateAttendanceStats(attendanceRecords);

  // Calculate stats from leave requests
  const leaveStats = calculateLeaveStats(Array.isArray(leaveData) ? leaveData : []);

  const displayAttendance = {
    ...attendanceSummary,
    present: attendanceStats.present,
    absent: attendanceStats.absent,
    leaves: leaveStats.approved, // Show approved leaves count in attendance card
    attendancePercentage: attendanceStats.attendancePercentage,
    totalWorkingDays: attendanceStats.totalWorkingDays
  } || {
    present: 0,
    absent: 0,
    leaves: 0,
    attendancePercentage: 0
  };

  const displayLeave = {
    casualLeave: leaveStats.casualLeave,
    sickLeave: leaveStats.sickLeave,
    earnedLeave: leaveStats.earnedLeave,
    approved: leaveStats.approved,
    pending: leaveStats.pending,
    totalDaysTaken: leaveStats.totalDaysTaken
  };

  const displaySalary = calculateSalaryWithLeaveDeduction(salaryData, leaveStats.totalDaysTaken) || { 
    baseSalary: 0, 
    calculatedSalary: 0,
    finalSalary: 0,
    month: 'N/A',
    leaveDeduction: 0
  };

  // Calculate performance display data
  const displayPerformance = calculatePerformanceRating(performanceData) || { 
    overallRating: 0, 
    attendance: 0, 
    productivity: 0, 
    teamwork: 0, 
    communication: 0,
    ratingLabel: 'No Data'
  };

  return (
    <div className={`employee-dashboard ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <header className="employee-header">
        <div className="employee-header-left">
          <button 
            className="emp-menu-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1>🏢 HRMS</h1>
        </div>
        <div className="employee-header-right">
          <button 
            className="emp-logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`employee-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <EmployeeSidebar isSidebarOpen={isSidebarOpen} employeeData={displayEmployee} activePage="dashboard" />
      </aside>

      {/* Main Content */}
      <main className="employee-main">
        {/* Welcome Section */}
        <section className="emp-welcome">
          <div>
            <h2>Welcome back, {displayEmployee.name}! 👋</h2>
            <p>{displayEmployee.jobTitle} • {displayEmployee.department}</p>
          </div>
          <div className="emp-quick-info">
            <span>🕐 In Time: {attendanceRecords.length > 0 && attendanceRecords[0]?.checkInTime ? new Date(attendanceRecords[0].checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
            <span>🚪 Out Time: {attendanceRecords.length > 0 && attendanceRecords[0]?.checkOutTime ? new Date(attendanceRecords[0].checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Not Yet'}</span>
            <span>📍 Status: {attendanceRecords.length > 0 && attendanceRecords[0]?.status ? attendanceRecords[0].status : 'Not Marked'}</span>
            <button 
              onClick={refreshAttendanceData}
              style={{
                padding: '8px 16px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s'
              }}
              title="Refresh Dashboard Data"
            >
              🔄 Refresh
            </button>
            <button 
              onClick={handleCheckIn}
              disabled={attendanceLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: checkInStatus === 'success' ? '#10b981' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: attendanceLoading ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: attendanceLoading ? 0.6 : 1,
                transition: 'all 0.3s'
              }}
            >
              <LogIn size={16} />
              Check In
            </button>
            <button 
              onClick={handleCheckOut}
              disabled={attendanceLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: checkOutStatus === 'success' ? '#10b981' : '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: attendanceLoading ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: attendanceLoading ? 0.6 : 1,
                transition: 'all 0.3s'
              }}
            >
              <LogOut size={16} />
              Check Out
            </button>
          </div>
        </section>

        {/* Summary Cards */}
        <section className="emp-cards-grid">
          {/* Attendance Card */}
          <div className="emp-card attendance-card">
            <div className="card-icon">
              <Clock size={28} />
            </div>
            <div className="card-content">
              <h3>Attendance</h3>
              <div className="attendance-stats">
                <div className="stat">
                  <span className="stat-label">Present</span>
                  <span className="stat-value">{displayAttendance.present || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Leaves</span>
                  <span className="stat-value">{displayAttendance.leaves || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Percentage</span>
                  <span className="stat-value">{displayAttendance.attendancePercentage || 0}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Balance Card */}
          <div className="emp-card leave-card">
            <div className="card-icon">
              <Calendar size={28} />
            </div>
            <div className="card-content">
              <h3>Leave Balance</h3>
              <div className="leave-summary">
                <div className="leave-item">
                  <span>Casual Leave</span>
                  <strong>{displayLeave.casualLeave?.available || 0}/{displayLeave.casualLeave?.total || 0}</strong>
                </div>
                <div className="leave-item">
                  <span>Sick Leave</span>
                  <strong>{displayLeave.sickLeave?.available || 0}/{displayLeave.sickLeave?.total || 0}</strong>
                </div>
                <div className="leave-item">
                  <span>Earned Leave</span>
                  <strong>{displayLeave.earnedLeave?.available || 0}/{displayLeave.earnedLeave?.total || 0}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Card */}
          <div className="emp-card salary-card">
            <div className="card-icon">
              <DollarSign size={28} />
            </div>
            <div className="card-content">
              <h3>Latest Salary</h3>
              <div className="salary-info">
                <div className="salary-amount">₹{displaySalary.finalSalary?.toLocaleString('en-IN') || '0'}</div>
                <div className="salary-month">{displaySalary.month || 'N/A'}</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  {displaySalary.totalLeaveDays > 0 ? (
                    <>
                      <div>Base: ₹{displaySalary.baseSalary?.toLocaleString('en-IN') || '0'}</div>
                      <div style={{ color: '#d32f2f' }}>Leaves ({displaySalary.totalLeaveDays}d): -₹{displaySalary.leaveDeduction?.toLocaleString('en-IN') || '0'}</div>
                    </>
                  ) : (
                    <div>No leave deductions</div>
                  )}
                </div>
                <div className="salary-status">✓ Calculated</div>
              </div>
            </div>
          </div>

          {/* Performance Card */}
          <div className="emp-card performance-card">
            <div className="card-icon">
              <TrendingUp size={28} />
            </div>
            <div className="card-content">
              <h3>Performance Rating</h3>
              <div className="performance-rating">
                <div className="rating-score">{displayPerformance.overallRating || 0}/5.0</div>
                <div className="rating-stars">⭐⭐⭐⭐⭐</div>
                <div className="rating-label">{displayPerformance.ratingLabel || 'Good'}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="emp-content-grid">
          {/* Left Column */}
          <section className="emp-section" id="my-attendance-section">
            {/* My Attendance with Statistics */}
            <div className="emp-widget">
              <h3>📅 My Attendance Statistics</h3>
              
              {/* Attendance Stats Summary */}
              <div className="attendance-stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{displayAttendance.attendancePercentage || 0}%</div>
                  <div className="stat-label">Attendance Rate</div>
                  <div className="trend-indicator up">
                    <span>📈 +{(displayAttendance.attendancePercentage || 0) - 80}%</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{displayAttendance.present || 0}</div>
                  <div className="stat-label">Present Days</div>
                  <div className="stat-subtitle">out of {displayAttendance.totalWorkingDays || 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{displayAttendance.onTimeArrival || 0}%</div>
                  <div className="stat-label">On-Time Arrival</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{displayAttendance.avgWorkingHours || 0}h</div>
                  <div className="stat-label">Avg. Working Hours</div>
                </div>
              </div>

              {/* Attendance Breakdown */}
              <div className="attendance-breakdown">
                <div className="breakdown-title">Monthly Breakdown</div>
                <div className="breakdown-items">
                  <div className="breakdown-item">
                    <span className="breakdown-label">Present</span>
                    <div className="breakdown-bar">
                      <div className="breakdown-fill present" style={{ width: `${(displayAttendance.present || 0) / (displayAttendance.totalWorkingDays || 1) * 100}%` }}></div>
                    </div>
                    <span className="breakdown-count">{displayAttendance.present || 0}</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Absent</span>
                    <div className="breakdown-bar">
                      <div className="breakdown-fill absent" style={{ width: `${(displayAttendance.absent || 0) / (displayAttendance.totalWorkingDays || 1) * 100}%` }}></div>
                    </div>
                    <span className="breakdown-count">{displayAttendance.absent || 0}</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Leaves</span>
                    <div className="breakdown-bar">
                      <div className="breakdown-fill leave" style={{ width: `${(displayAttendance.leaves || 0) / (displayAttendance.totalWorkingDays || 1) * 100}%` }}></div>
                    </div>
                    <span className="breakdown-count">{displayAttendance.leaves || 0}</span>
                  </div>
                </div>
              </div>

              {/* Monthly Trend Chart */}
              <div className="monthly-trend">
                <div className="trend-title">Attendance Trend (Last 3 Months)</div>
                <div className="trend-bars">
                  {displayAttendance.monthlyTrend?.map((month, idx) => (
                    <div key={idx} className="trend-bar-item">
                      <div className="trend-bar-container">
                        <div 
                          className="trend-bar-fill"
                          style={{ height: `${month.percentage}%` }}
                        ></div>
                      </div>
                      <div className="trend-month">{month.month}</div>
                      <div className="trend-value">{month.percentage}%</div>
                    </div>
                  )) || <p>No trend data available</p>}
                </div>
              </div>

              {/* Recent Attendance Records */}
              <div className="recent-attendance">
                <div className="records-title">Recent Attendance Records</div>
                <div className="attendance-table">
                  <div className="table-header">
                    <div>Date</div>
                    <div>Status</div>
                    <div>In Time</div>
                    <div>Out Time</div>
                    <div>Hours</div>
                  </div>
                  {attendanceRecords.length > 0 ? (
                    attendanceRecords.slice(0, 8).map((record, idx) => (
                      <div key={idx} className="table-row">
                        <div>{record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}</div>
                        <div className={`status ${record.status?.toLowerCase() || 'absent'}`}>{record.status || 'Absent'}</div>
                        <div>{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</div>
                        <div>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</div>
                        <div>{record.workingHours ? record.workingHours.toFixed(1) : '-'}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No attendance records available</div>
                  )}
                </div>
              </div>
            </div>

          </section>

          {/* Right Column */}
          <section className="emp-section">
            {/* Performance Rating */}
            <div className="emp-widget" id="performance-section">
              <h3>⭐ My Performance Rating</h3>
              <div className="performance-details">
                <div className="overall-rating">
                  <div className="rating-circle">
                    <div className="rating-score">{displayPerformance.overallRating || 0}</div>
                    <div className="rating-text">/ 5.0</div>
                  </div>
                  <div className="rating-level">{displayPerformance.ratingLabel || 'Good'}</div>
                </div>
                
                <div className="metrics-grid">
                  <div className="metric-item">
                    <span className="metric-label">Attendance</span>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{ width: `${displayPerformance.attendance || 0}%` }}></div>
                    </div>
                    <span className="metric-value">{displayPerformance.attendance || 0}%</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Productivity</span>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{ width: `${displayPerformance.productivity || 0}%` }}></div>
                    </div>
                    <span className="metric-value">{displayPerformance.productivity || 0}%</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Teamwork</span>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{ width: `${displayPerformance.teamwork || 0}%` }}></div>
                    </div>
                    <span className="metric-value">{displayPerformance.teamwork || 0}%</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Communication</span>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{ width: `${displayPerformance.communication || 0}%` }}></div>
                    </div>
                    <span className="metric-value">{displayPerformance.communication || 0}%</span>
                  </div>
                </div>

                <div className="reviews-list">
                  <h4>Quarterly Reviews</h4>
                  {displayPerformance.reviews?.map((review, idx) => (
                    <div key={idx} className="review-item">
                      <div className="review-header">
                        <span className="review-quarter">{review.quarter}</span>
                        <span className="review-rating">⭐ {review.rating}/5.0</span>
                      </div>
                      <p className="review-feedback">{review.feedback}</p>
                    </div>
                  )) || <p>No reviews available</p>}
                </div>
              </div>
            </div>
          </section>

          {/* Salary Slips Section */}
          <section className="emp-section" id="salary-slips-section">
            <div className="emp-widget salary-slips-widget">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <FileText size={24} />
                <h3 style={{ margin: 0 }}>📄 My Salary Slips</h3>
              </div>

              {salarySlips && salarySlips.length > 0 ? (
                <div className="salary-slips-table">
                  <div className="table-header">
                    <div>Month</div>
                    <div>Year</div>
                    <div>Net Salary</div>
                    <div>Gross Salary</div>
                    <div>Status</div>
                    <div>Action</div>
                  </div>
                  {salarySlips.map((slip, idx) => (
                    <div key={idx} className="table-row">
                      <div className="month-cell">
                        {slip.month ? new Date(2024, slip.month - 1).toLocaleString('en-US', { month: 'long' }) : 'N/A'}
                      </div>
                      <div>{slip.year || new Date().getFullYear()}</div>
                      <div className="salary-amount">₹{slip.netSalary ? slip.netSalary.toLocaleString('en-IN') : '0'}</div>
                      <div className="salary-amount">₹{slip.grossSalary ? slip.grossSalary.toLocaleString('en-IN') : '0'}</div>
                      <div>
                        <span className={`status-badge ${slip.status?.toLowerCase() || 'generated'}`}>
                          {slip.status || 'Generated'}
                        </span>
                      </div>
                      <div>
                        <button 
                          className="action-button download-btn"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `data:text/html,${encodeURIComponent(slip.htmlContent || '')}`;
                            link.download = `salary_slip_${slip.month}_${slip.year}.html`;
                            link.click();
                          }}
                          title="Download Salary Slip"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  padding: '30px', 
                  textAlign: 'center', 
                  color: '#999',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  borderRadius: '8px'
                }}>
                  <p>No salary slips available. HR will generate your salary slips each month.</p>
                </div>
              )}
            </div>
          </section>
        </div>
        </main>
      </div>
    );
  };
  
  export default EmployeeDashboard;
