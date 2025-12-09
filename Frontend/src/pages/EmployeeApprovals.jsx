import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Mail, Phone, MapPin, Eye, Trash2, AlertCircle, CheckCircle as Success, Calendar, Briefcase, User } from 'lucide-react';
import { getPendingEmployees } from '../services/hrService';
import '../styles/EmployeeApprovals.css';

const API_BASE_URL = '/api';

const EmployeeApprovals = () => {
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectedEmployeeId, setRejectedEmployeeId] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [filterDepartment, setFilterDepartment] = useState('all');

  useEffect(() => {
    fetchPendingEmployees();
  }, []);

  const fetchPendingEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getPendingEmployees();
      console.log('Pending employees response:', response);
      
      if (response?.success && response?.data) {
        setPendingEmployees(response.data);
      } else if (Array.isArray(response?.data)) {
        setPendingEmployees(response.data);
      } else if (Array.isArray(response)) {
        setPendingEmployees(response);
      } else {
        setError(response?.message || 'Failed to fetch pending employees');
        setPendingEmployees([]);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Error fetching employees: ' + err.message);
      setPendingEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (employeeId) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/hr-auth/approve/${employeeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        const employeeName = data.data?.fullName || data.data?.name || data.employee?.fullName || data.employee?.name || 'Employee';
        setSuccess(`✅ ${employeeName} approved successfully!`);
        setPendingEmployees(pendingEmployees.filter(emp => emp._id !== employeeId));
        setSelectedEmployee(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to approve employee');
      }
    } catch (err) {
      console.error('Error approving employee:', err);
      setError('Error approving employee: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (employeeId) => {
    if (!rejectReason.trim()) {
      setError('Please enter a rejection reason');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/hr-auth/reject/${employeeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: rejectReason })
      });

      const data = await response.json();
      if (response.ok) {
        const employeeName = data.data?.fullName || data.data?.name || data.employee?.fullName || data.employee?.name || 'Employee';
        setSuccess(`❌ ${employeeName} rejected.`);
        setPendingEmployees(pendingEmployees.filter(emp => emp._id !== employeeId));
        setShowRejectForm(false);
        setRejectReason('');
        setRejectedEmployeeId(null);
        setSelectedEmployee(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to reject employee');
      }
    } catch (err) {
      console.error('Error rejecting employee:', err);
      setError('Error rejecting employee: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sort and filter employees
  const getSortedAndFilteredEmployees = () => {
    let filtered = [...pendingEmployees];

    // Filter by department
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(emp => (emp.department || 'general').toLowerCase() === filterDepartment.toLowerCase());
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'name-asc':
        filtered.sort((a, b) => ((a.fullName || a.name) || '').localeCompare((b.fullName || b.name) || ''));
        break;
      case 'name-desc':
        filtered.sort((a, b) => ((b.fullName || b.name) || '').localeCompare((a.fullName || a.name) || ''));
        break;
      default:
        break;
    }

    return filtered;
  };

  const sortedEmployees = getSortedAndFilteredEmployees();
  const departments = [...new Set(pendingEmployees.map(emp => emp.department || 'General'))];

  return (
    <div className="approvals-container">
      {/* Header */}
      <div className="approvals-header">
        <div>
          <h1>👥 Employee Approval Requests</h1>
          <p>Review and approve pending employee signups</p>
        </div>
        <div className="header-stats">
          <div className="stat-box">
            <div className="stat-number">{pendingEmployees.length}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="alert alert-success">
          <Success size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Filters & Sorting */}
      {pendingEmployees.length > 0 && (
        <div className="filters-section">
          <div className="filter-group">
            <label>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
          {departments.length > 0 && (
            <div className="filter-group">
              <label>Department:</label>
              <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept.toLowerCase()}>{dept}</option>
                ))}
              </select>
            </div>
          )}
          <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', alignSelf: 'flex-end' }}>
            Showing {sortedEmployees.length} of {pendingEmployees.length}
          </div>
        </div>
      )}

      <div className="approvals-main">
        {/* Employee List */}
        <div className="employees-list-section">
          {loading && pendingEmployees.length === 0 ? (
            <div className="loading-state">
              <Clock size={48} />
              <p>Loading pending approvals...</p>
            </div>
          ) : pendingEmployees.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={64} />
              <h3>All Caught Up! ✨</h3>
              <p>No pending employee approvals at the moment</p>
            </div>
          ) : (
            <div className="employees-list">
              {sortedEmployees.map(employee => (
                <div
                  key={employee._id}
                  className={`employee-card ${selectedEmployee?._id === employee._id ? 'selected' : ''}`}
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <div className="employee-card-header">
                    <div className="employee-avatar">
                      {(employee.fullName || employee.name)?.charAt(0).toUpperCase()}
                    </div>
                    <div className="employee-info">
                      <h4>{employee.fullName || employee.name}</h4>
                      <p className="email">{employee.email}</p>
                    </div>
                  </div>
                  <div className="employee-card-meta">
                    <span className="signup-date">
                      📅 {new Date(employee.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Employee Details & Actions */}
        {selectedEmployee && (
          <div className="employee-details-section">
            <div className="details-header">
              <div className="details-title">
                <div className="large-avatar">
                  {(selectedEmployee.fullName || selectedEmployee.name)?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2>{selectedEmployee.fullName || selectedEmployee.name}</h2>
                  <p>{selectedEmployee.email}</p>
                </div>
              </div>
            </div>

            <div className="details-content">
              {/* Contact Information */}
              <div className="details-section">
                <h3>📞 Contact Information</h3>
                <div className="detail-row">
                  <label>Phone:</label>
                  <div className="detail-value">
                    <Phone size={16} />
                    <span>{selectedEmployee.phone}</span>
                  </div>
                </div>
                <div className="detail-row">
                  <label>Email:</label>
                  <div className="detail-value">
                    <Mail size={16} />
                    <span>{selectedEmployee.email}</span>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="details-section">
                <h3>📍 Address</h3>
                <div className="detail-row">
                  <label>Street:</label>
                  <span>{selectedEmployee.street}</span>
                </div>
                <div className="detail-row">
                  <label>City:</label>
                  <span>{selectedEmployee.city}</span>
                </div>
                <div className="detail-row">
                  <label>State:</label>
                  <span>{selectedEmployee.state}</span>
                </div>
                <div className="detail-row">
                  <label>Pin Code:</label>
                  <span>{selectedEmployee.pinCode}</span>
                </div>
              </div>

              {/* Signup Information */}
              <div className="details-section">
                <h3>📋 Signup Information</h3>
                <div className="detail-row">
                  <label>Signup Date:</label>
                  <span>{new Date(selectedEmployee.createdAt).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <label>Status:</label>
                  <span className="status-badge pending">
                    <Clock size={14} />
                    Pending Approval
                  </span>
                </div>
              </div>

              {/* Employment Details */}
              {(selectedEmployee.department || selectedEmployee.role || selectedEmployee.joinDate) && (
                <div className="details-section">
                  <h3>💼 Employment Details</h3>
                  {selectedEmployee.department && (
                    <div className="detail-row">
                      <label>Department:</label>
                      <span>{selectedEmployee.department}</span>
                    </div>
                  )}
                  {selectedEmployee.role && (
                    <div className="detail-row">
                      <label>Role:</label>
                      <span>{selectedEmployee.role}</span>
                    </div>
                  )}
                  {selectedEmployee.joinDate && (
                    <div className="detail-row">
                      <label>Join Date:</label>
                      <span>{new Date(selectedEmployee.joinDate).toLocaleDateString('en-IN')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Approval/Rejection Form */}
              {showRejectForm && rejectedEmployeeId === selectedEmployee._id ? (
                <div className="rejection-form">
                  <h3>Rejection Reason</h3>
                  <textarea
                    placeholder="Enter rejection reason..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows="4"
                  ></textarea>
                  <div className="form-actions">
                    <button
                      className="btn btn-cancel"
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectedEmployeeId(null);
                        setRejectReason('');
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-reject"
                      onClick={() => handleReject(selectedEmployee._id)}
                      disabled={loading || !rejectReason.trim()}
                    >
                      {loading ? 'Rejecting...' : 'Confirm Rejection'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="actions">
                  <h3>Actions</h3>
                  <div className="action-buttons">
                    <button
                      className="btn btn-approve"
                      onClick={() => handleApprove(selectedEmployee._id)}
                      disabled={loading}
                    >
                      <CheckCircle size={18} />
                      {loading ? 'Approving...' : 'Approve Employee'}
                    </button>
                    <button
                      className="btn btn-reject-trigger"
                      onClick={() => {
                        setShowRejectForm(true);
                        setRejectedEmployeeId(selectedEmployee._id);
                      }}
                      disabled={loading}
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeApprovals;
