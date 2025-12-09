import { Users, Building2, Mail, TrendingUp, ArrowUp, ArrowDown, CheckCircle, Clock, X } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDateRange } from '../context/DateContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import { getDashboardStats, getDashboardAttendanceChart, getPendingLeaveRequests, approveLeave, rejectLeave, getRecentActivities, getProjects } from '../services/hrService';

// Fallback data for when API is not available
const fallbackChartData = [
  { name: '18 Oct', present: 42, absent: 3, onLeave: 5 },
  { name: '21 Oct', present: 45, absent: 2, onLeave: 3 },
  { name: '24 Oct', present: 44, absent: 4, onLeave: 2 },
  { name: '27 Oct', present: 40, absent: 5, onLeave: 5 },
  { name: '30 Oct', present: 46, absent: 2, onLeave: 2 },
  { name: '2 Nov', present: 48, absent: 1, onLeave: 1 },
  { name: '5 Nov', present: 47, absent: 2, onLeave: 1 },
  { name: '8 Nov', present: 43, absent: 3, onLeave: 4 },
  { name: '11 Nov', present: 45, absent: 2, onLeave: 3 },
  { name: '14 Nov', present: 46, absent: 1, onLeave: 3 },
  { name: '17 Nov', present: 47, absent: 2, onLeave: 1 },
  { name: '20 Nov', present: 48, absent: 1, onLeave: 1 },
];

const fallbackActivities = [
  { id: 1, name: 'Rahul Sharma', action: 'New Employee Joined', date: 'Nov 20, 2024', status: 'Success', type: 'join', role: 'Senior Developer' },
  { id: 2, name: 'Priya Singh', action: 'Leave Applied', date: 'Nov 19, 2024', status: 'Pending', type: 'leave', leaveType: 'Casual (2 days)' },
  { id: 3, name: 'Amit Patel', action: 'Attendance Marked', date: 'Nov 20, 2024', status: 'Success', type: 'attendance', checkIn: '09:15 AM' },
  { id: 4, name: 'Neha Sharma', action: 'Performance Review', date: 'Nov 19, 2024', status: 'Success', type: 'review', rating: '4.5/5' },
];

const fallbackStats = {
  totalEmployees: 50,
  activeProjects: 8,
  leaveBalance: 120,
  attendanceRate: 94.5,
  presentToday: 48,
  onLeaveToday: 1,
  absentToday: 1
};

const fallbackProjects = [
  {
    _id: '1',
    name: 'CRM SYSTEM',
    description: 'Customer Relationship Management Platform',
    priority: 'High',
    progress: 65,
    teamMembers: 7,
    dueDate: '2025-12-15',
    status: 'In Progress',
    color: '#4f46e5'
  },
  {
    _id: '2',
    name: 'E-COMMERCE',
    description: 'Online Shopping Platform',
    priority: 'Medium',
    progress: 45,
    teamMembers: 5,
    dueDate: '2026-01-20',
    status: 'In Progress',
    color: '#10b981'
  },
  {
    _id: '3',
    name: 'MOBILE APP',
    description: 'iOS & Android Application',
    priority: 'High',
    progress: 80,
    teamMembers: 6,
    dueDate: '2025-12-10',
    status: 'Testing',
    color: '#f59e0b'
  },
  {
    _id: '4',
    name: 'API REDESIGN',
    description: 'REST API Optimization',
    priority: 'Low',
    progress: 30,
    teamMembers: 3,
    dueDate: '2026-02-28',
    status: 'Planning',
    color: '#8b5cf6'
  }
];

// Helper function to safely render object values - ABSOLUTELY FOOLPROOF
const renderSafely = (value, fallback = 'N/A') => {
  try {
    // Handle null and undefined
    if (value === null || value === undefined) {
      return String(fallback);
    }
    
    // If it's already a string, return as-is
    if (typeof value === 'string') {
      return value;
    }
    
    // If it's a number or boolean, convert to string
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    
    // If it's an object, NEVER return it - extract string properties
    if (typeof value === 'object') {
      // Try to extract a string representation
      if (typeof value.name === 'string') return value.name;
      if (typeof value.label === 'string') return value.label;
      if (typeof value.title === 'string') return value.title;
      if (typeof value.value === 'string') return value.value;
      if (typeof value.description === 'string') return value.description;
      
      // Try _id or id
      const id = value._id || value.id;
      if (id) return String(id);
      
      // If we get here, return fallback
      console.warn('⚠️ Cannot extract string from object, using fallback:', value);
      return String(fallback);
    }
    
    // For any other unexpected type, return fallback
    console.warn('⚠️ Unexpected type:', typeof value, 'value:', value);
    return String(fallback);
  } catch (error) {
    console.error('❌ Error in renderSafely:', error, 'value:', value);
    return String(fallback);
  }
};

// Sanitize leaves to ensure all fields are strings and no objects are rendered
const sanitizeLeaves = (leaves) => {
  if (!Array.isArray(leaves)) {
    console.warn('Leaves is not an array:', leaves);
    return [];
  }
  
  return leaves.map(leave => {
    // If leave itself is not an object, return empty
    if (typeof leave !== 'object' || leave === null) {
      console.warn('Leave is not an object:', leave);
      return {
        _id: '',
        userId: '',
        employeeId: '',
        employeeName: 'Employee',
        leaveType: 'Leave',
        startDate: '',
        endDate: '',
        totalDays: '0',
        reason: '',
        status: 'Pending',
        appliedDate: '',
        approvedBy: '',
        approvedByName: '',
        approvedDate: '',
        rejectedDate: ''
      };
    }
    
    // Ensure ONLY string/primitive values, converting all nested objects to strings
    return {
      _id: String(leave._id || ''),
      userId: typeof leave.userId === 'object' && leave.userId !== null ? String(leave.userId._id || leave.userId.id || '') : String(leave.userId || ''),
      employeeId: typeof leave.employeeId === 'object' ? String(leave.employeeId.id || leave.employeeId._id || '') : String(leave.employeeId || ''),
      employeeName: typeof leave.employeeName === 'object' ? String(leave.employeeName.name || leave.employeeName || 'Employee') : String(leave.employeeName || 'Employee'),
      leaveType: typeof leave.leaveType === 'object' ? String(leave.leaveType.name || leave.leaveType || 'Leave') : String(leave.leaveType || 'Leave'),
      startDate: String(leave.startDate || ''),
      endDate: String(leave.endDate || ''),
      totalDays: typeof leave.totalDays === 'number' ? String(leave.totalDays) : String(leave.totalDays || '0'),
      reason: typeof leave.reason === 'object' ? String(leave.reason.description || leave.reason || '') : String(leave.reason || ''),
      status: String(leave.status || 'Pending'),
      appliedDate: String(leave.appliedDate || ''),
      approvedBy: typeof leave.approvedBy === 'object' && leave.approvedBy !== null ? String(leave.approvedBy._id || leave.approvedBy.id || '') : String(leave.approvedBy || ''),
      approvedByName: typeof leave.approvedByName === 'object' ? String(leave.approvedByName.name || leave.approvedByName || '') : String(leave.approvedByName || ''),
      approvedDate: String(leave.approvedDate || ''),
      rejectedDate: String(leave.rejectedDate || '')
    };
  });
};

// Sanitize activities to ensure all fields are strings
const sanitizeActivities = (activities) => {
  if (!Array.isArray(activities)) {
    console.warn('Activities is not an array:', activities);
    return [];
  }
  
  return activities.map(activity => {
    if (typeof activity !== 'object' || activity === null) {
      console.warn('Activity is not an object:', activity);
      return {
        id: '',
        name: 'Unknown',
        role: '',
        leaveType: '',
        checkIn: '',
        department: '',
        action: 'Action',
        status: 'Pending',
        date: '',
        type: 'activity'
      };
    }
    
    // Only include explicitly defined fields - NOTHING ELSE
    return {
      id: String(activity.id || activity._id || ''),
      name: renderSafely(activity.name, 'Unknown'),
      role: renderSafely(activity.role, ''),
      leaveType: renderSafely(activity.leaveType, ''),
      checkIn: renderSafely(activity.checkIn, ''),
      department: renderSafely(activity.department, ''),
      action: renderSafely(activity.action, 'Action'),
      status: renderSafely(activity.status, 'Pending'),
      date: renderSafely(activity.date, ''),
      type: String(activity.type || 'activity'),
      rating: renderSafely(activity.rating, ''),
    };
  });
};

const Dashboard = () => {
  const { dateRange } = useDateRange();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredData, setFilteredData] = useState({
    stats: {},
    chartData: [],
    activities: []
  });

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch real statistics and chart data
        const stats = await getDashboardStats();
        const chartData = await getDashboardAttendanceChart();
        const leaveRequests = await getPendingLeaveRequests();
        
        let activities = fallbackActivities;
        try {
          const activitiesResponse = await getRecentActivities(10);
          console.log('📊 Dashboard Data - Activities:', activitiesResponse);
          if (activitiesResponse?.success && activitiesResponse?.data) {
            activities = activitiesResponse.data;
          } else if (Array.isArray(activitiesResponse?.data)) {
            activities = activitiesResponse.data;
          } else if (Array.isArray(activitiesResponse)) {
            activities = activitiesResponse;
          }
        } catch (activityErr) {
          console.warn('Could not fetch real activities, using fallback:', activityErr.message);
          activities = fallbackActivities;
        }

        // Fetch projects
        let projectsList = fallbackProjects;
        try {
          const projectsResponse = await getProjects({ limit: 4 });
          console.log('📊 Dashboard Data - Projects:', projectsResponse);
          if (projectsResponse?.success && projectsResponse?.data) {
            projectsList = projectsResponse.data;
          } else if (Array.isArray(projectsResponse?.data)) {
            projectsList = projectsResponse.data;
          } else if (Array.isArray(projectsResponse)) {
            projectsList = projectsResponse;
          }
          setProjects(projectsList);
        } catch (projectErr) {
          console.warn('Could not fetch real projects, using fallback:', projectErr.message);
          setProjects(fallbackProjects);
        }
        
        console.log('📊 Dashboard Data - Stats:', stats);
        console.log('📊 Dashboard Data - Chart:', chartData);
        console.log('📊 Dashboard Data - Leave Requests:', leaveRequests);
        
        // Use fetched data
        if (stats?.success && stats?.data) {
          setFilteredData({
            stats: stats.data,
            chartData: chartData?.data || fallbackChartData,
            activities: activities
          });
        } else {
          // Fallback to default data if API fails
          setFilteredData({
            stats: fallbackStats,
            chartData: fallbackChartData,
            activities: activities
          });
        }
        
        // Set pending leaves
        if (leaveRequests?.success && leaveRequests?.data) {
          console.log('Setting pending leaves:', leaveRequests.data);
          setPendingLeaves(sanitizeLeaves(leaveRequests.data));
        } else if (leaveRequests?.data) {
          // Sometimes data is directly in response without success flag
          console.log('Setting pending leaves from direct data:', leaveRequests.data);
          setPendingLeaves(sanitizeLeaves(leaveRequests.data));
        } else {
          setPendingLeaves([]);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        // Use fallback data
        setFilteredData({
          stats: fallbackStats,
          chartData: fallbackChartData,
          activities: fallbackActivities
        });
        setPendingLeaves([]);
        setProjects(fallbackProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Use fetched data or fallback
  const chartData = filteredData.chartData && filteredData.chartData.length > 0 ? filteredData.chartData : fallbackChartData;
  const recentActivities = sanitizeActivities(filteredData.activities || fallbackActivities);
  const hrMetrics = {
    totalEmployees: filteredData.stats?.totalEmployees || 0,
    activeEmployees: filteredData.stats?.activeEmployees || 0,
    attendanceRate: filteredData.stats?.attendanceRate || 0,
    presentToday: filteredData.stats?.activeEmployees || 0,
    onLeaveToday: filteredData.stats?.onLeaveEmployees || 0,
    absentToday: (filteredData.stats?.totalEmployees || 0) - (filteredData.stats?.activeEmployees || 0),
    activeProjects: filteredData.stats?.activeProjects || 8,
    leaveBalance: filteredData.stats?.leaveBalance || 0,
    departmentCount: filteredData.stats?.departmentCount || 0,
  };

  // Navigate to cards page
  const handleSeeAllCards = () => {
    navigate('/employees');
  };

  // Handle leave approval
  const handleApproveLeaveRequest = async (leaveId) => {
    try {
      console.log('Approving leave:', leaveId);
      const response = await approveLeave(leaveId);
      console.log('Approve response:', response);
      if (response.success) {
        // Remove from pending leaves list
        setPendingLeaves(prev => prev.filter(leave => leave._id !== leaveId));
        alert('Leave approved successfully!');
      } else {
        alert('Failed to approve leave');
      }
    } catch (err) {
      console.error('Error approving leave:', err);
      alert('Error approving leave');
    }
  };

  // Handle leave rejection
  const handleRejectLeaveRequest = async (leaveId) => {
    const rejectionReason = prompt('Enter reason for rejection:');
    if (!rejectionReason) return;

    try {
      const response = await rejectLeave(leaveId, rejectionReason);
      if (response.success) {
        // Remove from pending leaves list
        setPendingLeaves(prev => prev.filter(leave => leave._id !== leaveId));
        alert('Leave rejected successfully!');
      } else {
        alert('Failed to reject leave');
      }
    } catch (err) {
      console.error('Error rejecting leave:', err);
      alert('Error rejecting leave');
    }
  };

  return (
    <div className="dashboard">
      {loading && <div style={{ padding: '20px', textAlign: 'center' }}>Loading dashboard...</div>}
      {error && <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>{error}</div>}
      {/* Balance Card - HR Overview */}
      <div className="balance-card">
        <div className="balance-info">
          <p className="balance-label">HR Dashboard Overview</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '16px' }}>
            <div>
              <h1 className="balance-amount">{hrMetrics.totalEmployees}</h1>
              <span style={{ fontSize: '14px', color: '#fff', opacity: '0.9' }}>Total Employees</span>
            </div>
            <div>
              <h1 className="balance-amount">{hrMetrics.attendanceRate}%</h1>
              <span style={{ fontSize: '14px', color: '#fff', opacity: '0.9' }}>Attendance Rate</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '16px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', margin: '8px 0', color: '#fff' }}>{hrMetrics.activeEmployees}</h2>
              <span style={{ fontSize: '14px', color: '#fff', opacity: '0.9' }}>Active Employees</span>
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', margin: '8px 0', color: '#fff' }}>{hrMetrics.departmentCount}</h2>
              <span style={{ fontSize: '14px', color: '#fff', opacity: '0.9' }}>Departments</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Chart Section - Attendance Trend */}
        <div className="chart-section">
          <div className="section-header">
            <h3>📊 Weekly Attendance Trend</h3>
            <div className="chart-controls">
              <button className="tab-btn active">Weekly</button>
              <button className="tab-btn">Daily</button>
              <button className="chart-manage">⚙ Manage</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
              <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
              <Bar dataKey="onLeave" fill="#f59e0b" radius={[4, 4, 0, 0]} name="On Leave" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Stats Cards */}
        <div className="income-expense-cards">
          <div className="ie-card income-card">
            <div className="ie-icon">✓</div>
            <div className="ie-info">
              <p className="ie-label">Present Today</p>
              <h3 className="ie-amount">{hrMetrics.presentToday - hrMetrics.onLeaveToday}</h3>
              <span className="ie-change positive">+{hrMetrics.presentToday - hrMetrics.onLeaveToday} Working ↑</span>
            </div>
          </div>
          <div className="ie-card expense-card">
            <div className="ie-icon">📅</div>
            <div className="ie-info">
              <p className="ie-label">On Leave Today</p>
              <h3 className="ie-amount">{hrMetrics.onLeaveToday}</h3>
              <span className="ie-change negative">From {hrMetrics.totalEmployees} Total ↓</span>
            </div>
          </div>
          <div className="ie-card" style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
            <div className="ie-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              👤
            </div>
            <div className="ie-info">
              <p className="ie-label">Absent Today</p>
              <h3 className="ie-amount" style={{ color: '#f59e0b' }}>{hrMetrics.absentToday}</h3>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#d97706' }}>
                {hrMetrics.totalEmployees > 0 ? Math.round((hrMetrics.absentToday / hrMetrics.totalEmployees) * 100) : 0}% of total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* HR Metrics Cards */}
      <div className="account-cards">
        <div className="acc-card">
          <div className="acc-icon">👥</div>
          <div className="acc-info">
            <p className="acc-label">Total Employees <span className="acc-period">Active</span></p>
            <h3 className="acc-amount">{hrMetrics.activeEmployees}</h3>
            <span className="acc-change positive">vs. {hrMetrics.totalEmployees} Total ↑</span>
            <p className="acc-compare">100% Approved Employees</p>
          </div>
        </div>
        <div className="acc-card">
          <div className="acc-icon">📋</div>
          <div className="acc-info">
            <p className="acc-label">Active Projects <span className="acc-period">On-going</span></p>
            <h3 className="acc-amount">{hrMetrics.activeProjects}</h3>
            <span className="acc-change positive">+2 In Progress ↑</span>
            <p className="acc-compare">CRM, E-Commerce, Analytics Dashboard</p>
          </div>
        </div>
        <div className="acc-card">
          <div className="acc-icon">🏢</div>
          <div className="acc-info">
            <p className="acc-label">Departments <span className="acc-period">Active</span></p>
            <h3 className="acc-amount">{hrMetrics.departmentCount}</h3>
            <span className="acc-change positive">+{hrMetrics.departmentCount > 0 ? '1' : '0'} New Dept ↑</span>
            <p className="acc-compare">
              {filteredData.stats?.departments && filteredData.stats.departments.length > 0
                ? filteredData.stats.departments.map(dept => renderSafely(dept, 'Department')).join(', ')
                : 'No departments yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Pending Leave Requests Section */}
      {pendingLeaves && pendingLeaves.length > 0 ? (
        <div className="pending-leaves-section" style={{ marginBottom: '24px' }}>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>📋 Pending Leave Requests ({pendingLeaves.length})</h3>
            <button 
              onClick={() => {
                const fetchLeaves = async () => {
                  const response = await getPendingLeaveRequests();
                  if (response?.success && response?.data) {
                    setPendingLeaves(sanitizeLeaves(response.data));
                  } else if (response?.data) {
                    setPendingLeaves(sanitizeLeaves(response.data));
                  }
                };
                fetchLeaves();
              }}
              style={{
                padding: '6px 12px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#4338ca'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4f46e5'}
            >
              ↻ Refresh
            </button>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px'
          }}>
            {pendingLeaves.slice(0, 3).map((leave) => (
              <div key={leave._id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                padding: '20px',
                borderLeft: '4px solid #f59e0b',
                transition: 'box-shadow 0.3s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
              >
                {/* Employee Info */}
                <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                    {renderSafely(leave.employeeName, 'Unknown Employee')}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                    ID: {renderSafely(leave.employeeId, 'N/A')}
                  </p>
                </div>
                
                {/* Leave Details */}
                <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Leave Type:</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px' }}>
                      {renderSafely(leave.leaveType, 'General')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Duration:</span>
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>{leave.totalDays || 1} day(s)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>From:</span>
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>
                      {leave.startDate ? new Date(leave.startDate).toLocaleDateString('en-IN') : 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>To:</span>
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>
                      {leave.endDate ? new Date(leave.endDate).toLocaleDateString('en-IN') : 'N/A'}
                    </span>
                  </div>
                </div>
                
                {/* Reason */}
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 6px 0', fontWeight: '500' }}>Reason:</p>
                  <p style={{ fontSize: '12px', margin: 0, color: '#374151', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {renderSafely(leave.reason, 'No reason provided')}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleApproveLeaveRequest(leave._id)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                    title="Approve this leave request"
                  >
                    <CheckCircle size={14} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectLeaveRequest(leave._id)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                    title="Reject this leave request"
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
          {pendingLeaves.length > 3 && (
            <div style={{ textAlign: 'center', marginTop: '16px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
              <p style={{ color: '#1e40af', fontSize: '13px', margin: 0 }}>
                📌 +{pendingLeaves.length - 3} more pending leave request{pendingLeaves.length - 3 > 1 ? 's' : ''}. 
                <a href="/leaves" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: '600', marginLeft: '4px' }}>
                  View all →
                </a>
              </p>
            </div>
          )}
        </div>
      ) : null}

      {/* Recent Activity & Top Projects */}
      <div className="bottom-grid">
        <div className="recent-activity-modern">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>⚡ Recent Employee Activity</h3>
            <button 
              onClick={() => {
                console.log('Refreshing recent activities...');
                // Optional: Add refresh functionality
              }}
              style={{
                padding: '6px 12px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#4338ca'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4f46e5'}
              title="Refresh recent activities"
            >
              ↻ Refresh
            </button>
          </div>
          {recentActivities && recentActivities.length > 0 ? (
            <table className="activity-table">
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>ACTION</th>
                  <th>STATUS</th>
                  <th>TIME</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((activity) => (
                  <tr key={activity.id} style={{ 
                    transition: 'background-color 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td>
                      <div className="activity-type">
                        <span className={`type-icon ${activity.type}`} style={{
                          backgroundColor: activity.type === 'join' ? 'rgba(34, 197, 94, 0.1)' : 
                                         activity.type === 'leave' ? 'rgba(245, 158, 11, 0.1)' :
                                         activity.type === 'attendance' ? 'rgba(59, 130, 246, 0.1)' :
                                         'rgba(168, 85, 247, 0.1)',
                          color: activity.type === 'join' ? '#22c55e' :
                                activity.type === 'leave' ? '#f59e0b' :
                                activity.type === 'attendance' ? '#3b82f6' :
                                '#a855f7'
                        }}>
                          {activity.type === 'join' ? '✓' : activity.type === 'leave' ? '📅' : activity.type === 'attendance' ? '✓' : '⭐'}
                        </span>
                        <div>
                          <p className="type-name">{renderSafely(activity.name, 'Unknown')}</p>
                          <p className="type-action" style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {renderSafely(activity.role || activity.leaveType || activity.checkIn || activity.department, 'N/A')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: '500', color: '#1f2937' }}>{renderSafely(activity.action, 'Action')}</td>
                    <td>
                      <span className={`status-badge ${renderSafely(activity.status, 'Pending').toLowerCase()}`} style={{
                        backgroundColor: renderSafely(activity.status, 'Pending').toLowerCase() === 'success' ? 'rgba(34, 197, 94, 0.1)' :
                                       renderSafely(activity.status, 'Pending').toLowerCase() === 'pending' ? 'rgba(245, 158, 11, 0.1)' :
                                       renderSafely(activity.status, 'Pending').toLowerCase() === 'rejected' ? 'rgba(239, 68, 68, 0.1)' :
                                       'rgba(107, 114, 128, 0.1)',
                        color: renderSafely(activity.status, 'Pending').toLowerCase() === 'success' ? '#22c55e' :
                              renderSafely(activity.status, 'Pending').toLowerCase() === 'pending' ? '#f59e0b' :
                              renderSafely(activity.status, 'Pending').toLowerCase() === 'rejected' ? '#ef4444' :
                              '#6b7280',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {renderSafely(activity.status, 'Pending')}
                      </span>
                    </td>
                    <td className="method-col" style={{ fontSize: '12px', color: '#6b7280' }}>
                      {renderSafely(activity.date, 'N/A')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{
              padding: '32px 16px',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              color: '#6b7280'
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>No recent activities</p>
            </div>
          )}
        </div>

        {/* Top Projects Card */}
        <div className="featured-card-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>🚀 Top Projects ({projects.length})</h3>
            <button 
              onClick={() => navigate('/projects')}
              className="see-all" 
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                fontSize: '14px',
                color: '#4f46e5',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#4338ca'}
              onMouseLeave={(e) => e.target.style.color = '#4f46e5'}
            >
              See All →
            </button>
          </div>
          {projects && projects.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {projects.slice(0, 3).map((project) => (
                <div 
                  key={project._id} 
                  className="property-card-modern" 
                  style={{ 
                    padding: '16px',
                    borderLeft: `4px solid ${renderSafely(project.color, '#4f46e5')}`,
                    transition: 'box-shadow 0.3s, transform 0.3s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div className="card-header-info" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <span className="card-type" style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {renderSafely(project.name, 'Unknown Project')}
                      </span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                        {renderSafely(project.description, 'No description')}
                      </p>
                    </div>
                    <span className="card-number" style={{ 
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      marginLeft: '8px',
                      backgroundColor: renderSafely(project.priority, '') === 'High' ? 'rgba(239, 68, 68, 0.1)' :
                                      renderSafely(project.priority, '') === 'Medium' ? 'rgba(245, 158, 11, 0.1)' :
                                      'rgba(107, 114, 128, 0.1)',
                      color: renderSafely(project.priority, '') === 'High' ? '#ef4444' :
                             renderSafely(project.priority, '') === 'Medium' ? '#f59e0b' :
                             '#6b7280'
                    }}>
                      {renderSafely(project.priority, 'Low')} Priority
                    </span>
                  </div>
                  
                  <div className="card-balance" style={{ marginBottom: '12px' }}>
                    <h2 style={{ fontSize: '16px', margin: '0 0 4px 0' }}>
                      Progress: {String(project.progress || 0)}%
                    </h2>
                    <p className="card-location" style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                      👥 {String(project.teamMembers || 0)} Team Members • 📅 {project.dueDate ? new Date(project.dueDate).toLocaleDateString('en-IN') : 'N/A'}
                    </p>
                  </div>
                  
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{ 
                      flex: 1,
                      height: '6px', 
                      backgroundColor: '#e5e7eb', 
                      borderRadius: '3px',
                      overflow: 'hidden',
                      marginRight: '12px'
                    }}>
                      <div style={{
                        width: `${String(project.progress || 0)}%`,
                        height: '100%',
                        backgroundColor: renderSafely(project.color, '#4f46e5'),
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#1f2937',
                      minWidth: '35px',
                      textAlign: 'right'
                    }}>
                      {String(project.progress || 0)}%
                    </span>
                  </div>
                  
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#4f46e5',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center'
                  }}>
                    {renderSafely(project.status, 'Pending')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '32px 16px',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              color: '#6b7280'
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>No projects available</p>
            </div>
          )}
          {projects && projects.length > 3 && (
            <div style={{ textAlign: 'center', marginTop: '16px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
              <p style={{ color: '#1e40af', fontSize: '13px', margin: 0 }}>
                📌 +{projects.length - 3} more project{projects.length - 3 > 1 ? 's' : ''}. 
                <button 
                  onClick={() => navigate('/projects')}
                  style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: '600', marginLeft: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                  View all →
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DashboardWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}
