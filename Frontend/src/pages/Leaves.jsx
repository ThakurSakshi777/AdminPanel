import { useState, useEffect } from 'react';
import { Search, FileText, X, ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle } from 'lucide-react';
import { getLeaves, approveLeave, rejectLeave } from '../services/hrService';

// Helper function to safely render object values
const renderSafely = (value, fallback = 'N/A') => {
  if (typeof value === 'object' && value !== null) {
    return value.name || value.label || value._id || fallback;
  }
  return value || fallback;
};

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [approvalLoading, setApprovalLoading] = useState(null);

  // Fetch leaves from API
  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLeaves();
      
      console.log('Leaves API response:', response);
      
      if (response.success && response.data) {
        setLeaves(response.data);
      } else if (response.data && Array.isArray(response.data)) {
        setLeaves(response.data);
      } else {
        setError('Failed to load leaves');
        setLeaves([]);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
      setError('Error loading leaves');
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to approve this leave request?')) {
      return;
    }

    try {
      setApprovalLoading(leaveId);
      const response = await approveLeave(leaveId);
      
      console.log('Approve response:', response);
      
      if (response.success) {
        // Update local state
        setLeaves(prev => prev.map(leave => 
          leave._id === leaveId 
            ? { 
                ...leave, 
                status: 'Approved', 
                approvedByName: response.data?.approvedByName || 'HR Manager',
                approvedDate: response.data?.approvedDate || new Date().toISOString()
              }
            : leave
        ));
        alert('Leave approved successfully!');
      } else {
        alert(response.message || 'Failed to approve leave');
      }
    } catch (err) {
      console.error('Error approving leave:', err);
      alert('Error approving leave');
    } finally {
      setApprovalLoading(null);
    }
  };

  const handleRejectLeave = async (leaveId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      setApprovalLoading(leaveId);
      const response = await rejectLeave(leaveId, reason);
      
      console.log('Reject response:', response);
      
      if (response.success) {
        // Update local state
        setLeaves(prev => prev.map(leave => 
          leave._id === leaveId 
            ? { 
                ...leave, 
                status: 'Rejected', 
                approvedByName: response.data?.approvedByName || 'HR Manager',
                rejectedDate: response.data?.rejectedDate || new Date().toISOString(),
                rejectionReason: reason
              }
            : leave
        ));
        alert('Leave rejected successfully!');
      } else {
        alert(response.message || 'Failed to reject leave');
      }
    } catch (err) {
      console.error('Error rejecting leave:', err);
      alert('Error rejecting leave');
    } finally {
      setApprovalLoading(null);
    }
  };

  let filteredLeaves = leaves.filter(leave =>
    (leave.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     leave.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'All' || leave.status === statusFilter)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeaves = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const getLeaveTypeColor = (type) => {
    switch(type) {
      case 'Sick Leave': return '#ef4444';
      case 'Casual Leave': return '#3b82f6';
      case 'Paid Leave': return '#8b5cf6';
      case 'Unpaid Leave': return '#6b7280';
      case 'Emergency Leave': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const totalCasualLeavesUsed = leaves.filter(l => l.leaveType?.includes('Casual') && l.status === 'Approved').reduce((sum, l) => sum + (l.totalDays || 0), 0);
  const totalSickLeavesUsed = leaves.filter(l => l.leaveType?.includes('Sick') && l.status === 'Approved').reduce((sum, l) => sum + (l.totalDays || 0), 0);
  const totalPendingRequests = leaves.filter(l => l.status === 'Pending').length;

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>Leave Management</h2>
          <p className="subtitle">Manage and approve employee leave requests</p>
        </div>
        <button 
          className="btn-primary-modern"
          onClick={fetchLeaves}
          style={{ opacity: loading ? 0.6 : 1 }}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      {loading && <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading leave requests...</div>}
      {error && <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px' }}>⚠️ {error}</div>}

      {!loading && (
        <>
          <div className="search-bar">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search by name or employee ID..." 
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            />
            <select 
              value={statusFilter}
              onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1);}}
              style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Calendar size={24} />
              </div>
              <div className="stat-content">
                <h4>Casual Leaves Used</h4>
                <p className="stat-number">{totalCasualLeavesUsed} days</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FileText size={24} />
              </div>
              <div className="stat-content">
                <h4>Sick Leaves Used</h4>
                <p className="stat-number">{totalSickLeavesUsed} days</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <h4>Pending Requests</h4>
                <p className="stat-number">{totalPendingRequests}</p>
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Approved By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                      No leave requests found
                    </td>
                  </tr>
                ) : (
                  currentLeaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>
                        <div>
                          <strong>{renderSafely(leave.employeeName, 'Unknown')}</strong>
                          <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>{renderSafely(leave.employeeId, 'N/A')}</p>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '4px',
                          backgroundColor: getLeaveTypeColor(leave.leaveType) + '20',
                          color: getLeaveTypeColor(leave.leaveType),
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {renderSafely(leave.leaveType, 'Leave')}
                        </span>
                      </td>
                      <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                      <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                      <td><strong>{leave.totalDays}</strong> day{leave.totalDays > 1 ? 's' : ''}</td>
                      <td style={{ fontSize: '13px', maxWidth: '200px' }}>{renderSafely(leave.reason, 'No reason')}</td>
                      <td>
                        <span className={`badge-status ${getStatusColor(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {leave.approvedByName ? (
                          <div>
                            <strong>{renderSafely(leave.approvedByName, 'Approver')}</strong>
                            <p style={{ margin: '2px 0 0 0', color: '#666' }}>
                              {leave.approvedDate ? new Date(leave.approvedDate).toLocaleDateString() : 
                               leave.rejectedDate ? new Date(leave.rejectedDate).toLocaleDateString() : '-'}
                            </p>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <div className="action-buttons" style={{ gap: '4px' }}>
                          {leave.status === 'Pending' && (
                            <>
                              <button 
                                className="btn-icon" 
                                onClick={() => handleApproveLeave(leave._id)}
                                disabled={approvalLoading === leave._id}
                                title="Approve"
                                style={{ background: '#10b981', opacity: approvalLoading === leave._id ? 0.6 : 1 }}
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button 
                                className="btn-icon danger" 
                                onClick={() => handleRejectLeave(leave._id)}
                                disabled={approvalLoading === leave._id}
                                title="Reject"
                                style={{ opacity: approvalLoading === leave._id ? 0.6 : 1 }}
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredLeaves.length > itemsPerPage && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              
              <div className="pagination-numbers">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button 
                className="pagination-btn"
                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          <div className="pagination-info">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLeaves.length)} of {filteredLeaves.length} leave requests
          </div>
        </>
      )}
    </div>
  );
};

export default Leaves;
