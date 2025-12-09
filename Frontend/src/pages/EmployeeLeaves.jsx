import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Send, Menu, X, LogOut } from 'lucide-react';
import { getMyProfile, getMyLeaves, createLeaveRequest } from '../services/hrService';
import EmployeeSidebar from '../components/EmployeeSidebar';
import '../styles/EmployeeLeaves.css';

// Helper function to safely render object values
const renderSafely = (value, fallback = 'N/A') => {
  if (typeof value === 'object' && value !== null) {
    return value.name || value.label || value._id || fallback;
  }
  return value || fallback;
};

const EmployeeLeaves = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('balance');
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const [leaveData, setLeaveData] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [formData, setFormData] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await getMyProfile();
        if (profileRes.success) {
          setEmployeeData({
            name: profileRes.data.name,
            avatar: profileRes.data.name?.charAt(0).toUpperCase(),
            jobTitle: profileRes.data.position || 'Employee',
            department: profileRes.data.department || 'N/A',
          });
        }

        const leaveRes = await getMyLeaves();
        console.log('Leave response:', leaveRes);
        if (leaveRes.success) {
          // API returns: data (array of leave requests), statistics (stats object)
          const leavesArray = Array.isArray(leaveRes.data) ? leaveRes.data : [];
          const stats = leaveRes.statistics || {};

          setLeaveData({
            leaveRequests: leavesArray,
            statistics: stats,
            leaveBalance: [
              { 
                id: 1, 
                type: 'Casual Leave', 
                total: stats.casualLeave?.total || 12, 
                used: (stats.casualLeave?.total || 12) - (stats.casualLeave?.available || 12),
                available: stats.casualLeave?.available || 12, 
                color: '#3b82f6' 
              },
              { 
                id: 2, 
                type: 'Sick Leave', 
                total: stats.sickLeave?.total || 8, 
                used: (stats.sickLeave?.total || 8) - (stats.sickLeave?.available || 8),
                available: stats.sickLeave?.available || 8, 
                color: '#ef4444' 
              },
              { 
                id: 3, 
                type: 'Earned Leave', 
                total: stats.earnedLeave?.total || 20, 
                used: (stats.earnedLeave?.total || 20) - (stats.earnedLeave?.available || 20),
                available: stats.earnedLeave?.available || 20, 
                color: '#10b981' 
              },
            ]
          });
          setLeaveRequests(leavesArray);
        }
      } catch (err) {
        console.error('Error fetching leave data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const refreshLeaveData = async () => {
    try {
      const leaveRes = await getMyLeaves();
      console.log('Refreshed leave response:', leaveRes);
      if (leaveRes.success) {
        const leavesArray = Array.isArray(leaveRes.data) ? leaveRes.data : [];
        const stats = leaveRes.statistics || {};

        setLeaveData({
          leaveRequests: leavesArray,
          statistics: stats,
          leaveBalance: [
            { 
              id: 1, 
              type: 'Casual Leave', 
              total: stats.casualLeave?.total || 12, 
              used: (stats.casualLeave?.total || 12) - (stats.casualLeave?.available || 12),
              available: stats.casualLeave?.available || 12, 
              color: '#3b82f6' 
            },
            { 
              id: 2, 
              type: 'Sick Leave', 
              total: stats.sickLeave?.total || 8, 
              used: (stats.sickLeave?.total || 8) - (stats.sickLeave?.available || 8),
              available: stats.sickLeave?.available || 8, 
              color: '#ef4444' 
            },
            { 
              id: 3, 
              type: 'Earned Leave', 
              total: stats.earnedLeave?.total || 20, 
              used: (stats.earnedLeave?.total || 20) - (stats.earnedLeave?.available || 20),
              available: stats.earnedLeave?.available || 20, 
              color: '#10b981' 
            },
          ]
        });
        setLeaveRequests(leavesArray);
      }
    } catch (err) {
      console.error('Error refreshing leave data:', err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading leave data...</div>;
  if (!employeeData) return <div style={{ textAlign: 'center', padding: '40px' }}>No data available</div>;

  // Leave Balance Data from API
  const leaveBalance = leaveData?.leaveBalance || [
    { id: 1, type: 'Casual Leave', total: 12, used: 0, available: 12, color: '#3b82f6' },
    { id: 2, type: 'Sick Leave', total: 10, used: 0, available: 10, color: '#ef4444' },
    { id: 3, type: 'Earned Leave', total: 20, used: 0, available: 20, color: '#10b981' },
  ];

  // Calculate days between dates
  const calculateDays = (from, to) => {
    if (!from || !to) return 0;
    const start = new Date(from);
    const end = new Date(to);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitLeaveRequest = async (e) => {
    e.preventDefault();
    
    if (!formData.leaveType || !formData.fromDate || !formData.toDate || !formData.reason) {
      alert('Please fill all fields');
      return;
    }

    const days = calculateDays(formData.fromDate, formData.toDate);
    
    try {
      const response = await createLeaveRequest({
        leaveType: formData.leaveType,
        startDate: formData.fromDate,
        endDate: formData.toDate,
        totalDays: days,
        reason: formData.reason,
        status: 'Pending'
      });

      console.log('Leave request response:', response);

      if (response.success) {
        // Refresh the leave data
        await refreshLeaveData();
        
        setFormData({
          leaveType: '',
          fromDate: '',
          toDate: '',
          reason: '',
        });
        setShowForm(false);
        alert('Leave request submitted successfully!');
      } else {
        alert(response.message || 'Failed to submit leave request');
      }
    } catch (err) {
      console.error('Error submitting leave request:', err);
      alert('Error submitting leave request: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return '#10b981';
      case 'Rejected':
        return '#ef4444';
      case 'Pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle size={20} color="#10b981" />;
      case 'Rejected':
        return <XCircle size={20} color="#ef4444" />;
      case 'Pending':
        return <Clock size={20} color="#f59e0b" />;
      default:
        return null;
    }
  };

  return (
    <div className="employee-dashboard">
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

      <aside className={`employee-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <EmployeeSidebar isSidebarOpen={isSidebarOpen} employeeData={employeeData} activePage="leaves" />
      </aside>

      <main className="employee-main">
        <section className="emp-welcome">
          <div>
            <h2>My Leave Requests 📋</h2>
            <p>Manage your leave requests and view balance</p>
          </div>
        </section>

        <section className="emp-cards-grid">
          <div className="emp-card leave-card">
            <div className="card-icon">
              <Calendar size={28} />
            </div>
            <div className="card-content">
              <h3>Total Available</h3>
              <div className="leave-summary">
                <div className="leave-item">
                  <span>Days</span>
                  <strong>{leaveBalance.reduce((sum, leave) => sum + leave.available, 0)}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="emp-card attendance-card">
            <div className="card-icon">
              <Clock size={28} />
            </div>
            <div className="card-content">
              <h3>Used This Year</h3>
              <div className="attendance-stats">
                <div className="stat">
                  <span className="stat-label">Total</span>
                  <span className="stat-value">{leaveBalance.reduce((sum, leave) => sum + leave.used, 0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="emp-card performance-card">
            <div className="card-icon">
              <Send size={28} />
            </div>
            <div className="card-content">
              <h3>Pending Approval</h3>
              <div className="performance-rating">
                <div className="rating-score">{leaveRequests.filter(req => req.status === 'Pending').length}</div>
              </div>
            </div>
          </div>
        </section>

        <div className="emp-content-grid">
          <section className="emp-section" style={{ gridColumn: '1 / -1' }}>
            <div className="emp-widget">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Leave Management</h3>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '12px' }}>
                <button
                  onClick={() => setActiveTab('balance')}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    background: activeTab === 'balance' ? '#667eea' : 'transparent',
                    color: activeTab === 'balance' ? 'white' : '#6b7280',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: activeTab === 'balance' ? '600' : 'normal',
                    transition: 'all 0.3s'
                  }}
                >
                  📊 Leave Balance
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    background: activeTab === 'requests' ? '#667eea' : 'transparent',
                    color: activeTab === 'requests' ? 'white' : '#6b7280',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: activeTab === 'requests' ? '600' : 'normal',
                    transition: 'all 0.3s'
                  }}
                >
                  📋 My Requests
                </button>
              </div>

              {activeTab === 'balance' && (
                <div>
                  <h4 style={{ marginTop: '20px', marginBottom: '16px', fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                    Leave Balance Overview
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                    {leaveBalance.map(leave => (
                      <div key={leave.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>{leave.type}</h5>
                          <span style={{ background: '#f0f4ff', color: '#667eea', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                            {leave.total} days
                          </span>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(leave.used / leave.total) * 100}%`, backgroundColor: leave.color }} />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                          <div>
                            <div style={{ color: '#6b7280', marginBottom: '4px' }}>Used</div>
                            <div style={{ fontWeight: '700', color: leave.color }}>{leave.used} days</div>
                          </div>
                          <div>
                            <div style={{ color: '#6b7280', marginBottom: '4px' }}>Available</div>
                            <div style={{ fontWeight: '700', color: '#10b981' }}>{leave.available} days</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '12px', padding: '8px', background: '#f9fafb', borderRadius: '4px', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                          {Math.round((leave.used / leave.total) * 100)}% used
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'requests' && (
                <div>
                  {!showForm && (
                    <button
                      onClick={() => setShowForm(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        marginBottom: '16px'
                      }}
                    >
                      <Send size={16} /> Submit New Leave Request
                    </button>
                  )}

                  {showForm && (
                    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                      <h4 style={{ marginTop: 0, marginBottom: '16px', fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>
                        Submit Leave Request
                      </h4>
                      <form onSubmit={handleSubmitLeaveRequest}>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                            Leave Type
                          </label>
                          <select
                            name="leaveType"
                            value={formData.leaveType}
                            onChange={handleFormChange}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                          >
                            <option value="">Select Leave Type</option>
                            {leaveBalance.map(leave => (
                              <option key={leave.id} value={leave.type}>
                                {leave.type} ({leave.available} available)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                              From Date
                            </label>
                            <input
                              type="date"
                              name="fromDate"
                              value={formData.fromDate}
                              onChange={handleFormChange}
                              required
                              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                              To Date
                            </label>
                            <input
                              type="date"
                              name="toDate"
                              value={formData.toDate}
                              onChange={handleFormChange}
                              required
                              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                            />
                          </div>
                        </div>

                        {formData.fromDate && formData.toDate && (
                          <div style={{ background: 'white', padding: '10px 12px', borderRadius: '6px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', borderLeft: '3px solid #667eea' }}>
                            <span style={{ fontWeight: '600', color: '#374151' }}>Duration:</span>
                            <span style={{ fontWeight: '700', color: '#667eea', fontSize: '16px' }}>
                              {calculateDays(formData.fromDate, formData.toDate)} days
                            </span>
                          </div>
                        )}

                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                            Reason for Leave
                          </label>
                          <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleFormChange}
                            placeholder="Enter reason for leave..."
                            rows="3"
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit' }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            style={{
                              padding: '8px 16px',
                              background: 'white',
                              color: '#374151',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '13px'
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            style={{
                              padding: '8px 16px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '13px'
                            }}
                          >
                            Submit Request
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <h4 style={{ marginTop: '20px', marginBottom: '16px', fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                    Your Leave Requests
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {leaveRequests.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                        <Calendar size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                        <p>No leave requests yet</p>
                      </div>
                    ) : (
                      leaveRequests.map(request => (
                        <div
                          key={request._id}
                          style={{
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderLeft: `4px solid ${getStatusColor(request.status)}`,
                            borderRadius: '8px',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            onClick={() => setExpandedRequest(expandedRequest === request._id ? null : request._id)}
                            style={{
                              padding: '16px',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: expandedRequest === request._id ? '#f9fafb' : 'white'
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <span style={{ fontWeight: '700', color: '#1f2937', fontSize: '14px' }}>
                                  {renderSafely(request.leaveType, 'Leave')}
                                </span>
                                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                                  {request.totalDays} days
                                </span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {getStatusIcon(request.status)}
                              {expandedRequest === request._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                          </div>

                          {expandedRequest === request._id && (
                            <div style={{ padding: '16px', background: '#f9fafb', borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <span style={{ minWidth: '120px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>📅 Date Range:</span>
                                <span style={{ color: '#1f2937', fontSize: '13px' }}>
                                  {new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <span style={{ minWidth: '120px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>📝 Reason:</span>
                                <span style={{ color: '#1f2937', fontSize: '13px' }}>{request.reason}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <span style={{ minWidth: '120px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>📤 Applied On:</span>
                                <span style={{ color: '#1f2937', fontSize: '13px' }}>{new Date(request.appliedDate).toLocaleDateString()}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <span style={{ minWidth: '120px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>✓ Status:</span>
                                <span style={{ color: getStatusColor(request.status), fontWeight: '600', fontSize: '13px' }}>
                                  {request.status}
                                </span>
                              </div>
                              {request.approverComment && (
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                  <span style={{ minWidth: '120px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>💬 Comment:</span>
                                  <span style={{ color: '#1f2937', fontSize: '13px' }}>{request.approverComment}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default EmployeeLeaves;
