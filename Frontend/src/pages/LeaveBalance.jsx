import { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

const LeaveBalance = () => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Leave balance data
  const leaveData = {
    casualLeave: {
      icon: '☀️',
      name: 'Casual Leave',
      total: 12,
      used: 4,
      pending: 2,
      color: '#f59e0b',
      description: 'For casual occasions and personal needs'
    },
    sickLeave: {
      icon: '🏥',
      name: 'Sick Leave',
      total: 10,
      used: 2,
      pending: 0,
      color: '#ef4444',
      description: 'For medical and health reasons'
    },
    earnedLeave: {
      icon: '📅',
      name: 'Earned Leave',
      total: 20,
      used: 5,
      pending: 1,
      color: '#3b82f6',
      description: 'Accumulated based on service'
    },
    maternityLeave: {
      icon: '👶',
      name: 'Maternity Leave',
      total: 90,
      used: 0,
      pending: 0,
      color: '#ec4899',
      description: 'For pregnant employees'
    },
    paternityLeave: {
      icon: '👨‍👧',
      name: 'Paternity Leave',
      total: 10,
      used: 0,
      pending: 0,
      color: '#8b5cf6',
      description: 'For new fathers'
    },
    compOff: {
      icon: '⚡',
      name: 'Comp Off',
      total: 3,
      used: 1,
      pending: 0,
      color: '#10b981',
      description: 'Compensatory off for extra work'
    }
  };

  const leaveRequests = [
    {
      id: 1,
      type: 'Casual Leave',
      from: '2024-12-01',
      to: '2024-12-03',
      days: 3,
      status: 'Pending',
      reason: 'Personal work',
      appliedOn: '2024-11-27'
    },
    {
      id: 2,
      type: 'Earned Leave',
      from: '2024-12-20',
      to: '2024-12-22',
      days: 3,
      status: 'Approved',
      reason: 'Vacation',
      appliedOn: '2024-11-15'
    },
    {
      id: 3,
      type: 'Sick Leave',
      from: '2024-11-22',
      to: '2024-11-23',
      days: 2,
      status: 'Approved',
      reason: 'Medical appointment',
      appliedOn: '2024-11-22'
    }
  ];

  const getAvailableLeaves = (category) => {
    return category.total - category.used;
  };

  const getUsagePercentage = (category) => {
    return ((category.used / category.total) * 100).toFixed(1);
  };

  const toggleCategory = (key) => {
    setExpandedCategory(expandedCategory === key ? null : key);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return '#10b981';
      case 'Pending':
        return '#f59e0b';
      case 'Rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getTotalStats = () => {
    const stats = {
      totalLeaves: 0,
      totalUsed: 0,
      totalPending: 0
    };

    Object.values(leaveData).forEach(leave => {
      stats.totalLeaves += leave.total;
      stats.totalUsed += leave.used;
      stats.totalPending += leave.pending;
    });

    return stats;
  };

  const stats = getTotalStats();

  return (
    <div className="leave-balance-page">
      {/* Header */}
      <div className="leave-balance-header">
        <h1>📅 My Leave Balance</h1>
        <p>View your leave balance and manage leave requests</p>
      </div>

      {/* Summary Cards */}
      <div className="leave-summary-grid">
        <div className="summary-card total">
          <div className="summary-icon">
            <Calendar size={24} />
          </div>
          <div className="summary-info">
            <span className="summary-label">Total Leaves</span>
            <span className="summary-value">{stats.totalLeaves}</span>
          </div>
        </div>

        <div className="summary-card used">
          <div className="summary-icon">
            <CheckCircle size={24} />
          </div>
          <div className="summary-info">
            <span className="summary-label">Leaves Used</span>
            <span className="summary-value">{stats.totalUsed}</span>
          </div>
        </div>

        <div className="summary-card pending">
          <div className="summary-icon">
            <Clock size={24} />
          </div>
          <div className="summary-info">
            <span className="summary-label">Pending Approval</span>
            <span className="summary-value">{stats.totalPending}</span>
          </div>
        </div>

        <div className="summary-card available">
          <div className="summary-icon">
            <TrendingUp size={24} />
          </div>
          <div className="summary-info">
            <span className="summary-label">Available</span>
            <span className="summary-value">{stats.totalLeaves - stats.totalUsed}</span>
          </div>
        </div>
      </div>

      {/* Leave Balance Details */}
      <div className="leave-details-section">
        <h2>Leave Balance Details</h2>

        <div className="leave-categories-container">
          {Object.entries(leaveData).map(([key, category]) => {
            const available = getAvailableLeaves(category);
            const usagePercentage = getUsagePercentage(category);
            const isExpanded = expandedCategory === key;

            return (
              <div key={key} className="leave-category-card">
                <div 
                  className="category-header"
                  onClick={() => toggleCategory(key)}
                >
                  <div className="category-title">
                    <span className="category-icon">{category.icon}</span>
                    <div className="category-info">
                      <h3>{category.name}</h3>
                      <p>{category.description}</p>
                    </div>
                  </div>
                  <div className="category-stats">
                    <div className="stat-badge available">
                      <span className="badge-label">Available</span>
                      <span className="badge-value">{available}</span>
                    </div>
                    <div className="stat-badge used">
                      <span className="badge-label">Used</span>
                      <span className="badge-value">{category.used}</span>
                    </div>
                    <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="category-details">
                    <div className="progress-bar-container">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{
                            width: `${usagePercentage}%`,
                            backgroundColor: category.color
                          }}
                        ></div>
                      </div>
                      <span className="progress-text">{usagePercentage}% Used</span>
                    </div>

                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Total Allocated</span>
                        <span className="detail-value">{category.total}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Used</span>
                        <span className="detail-value used-value">{category.used}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Available</span>
                        <span className="detail-value available-value">{available}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Pending Approval</span>
                        <span className="detail-value pending-value">{category.pending}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leave Requests */}
      <div className="leave-requests-section">
        <h2>Recent Leave Requests</h2>

        <div className="requests-table-wrapper">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Applied On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <span className="type-badge">{request.type}</span>
                  </td>
                  <td>{new Date(request.from).toLocaleDateString()}</td>
                  <td>{new Date(request.to).toLocaleDateString()}</td>
                  <td className="text-center">{request.days}</td>
                  <td>{request.reason}</td>
                  <td>{new Date(request.appliedOn).toLocaleDateString()}</td>
                  <td>
                    <span 
                      className={`status-badge ${request.status.toLowerCase()}`}
                      style={{ backgroundColor: getStatusColor(request.status) + '20', color: getStatusColor(request.status) }}
                    >
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {leaveRequests.length === 0 && (
          <div className="no-requests">
            <AlertCircle size={40} />
            <p>No leave requests found</p>
          </div>
        )}
      </div>

      {/* Quick Info */}
      <div className="leave-info-box">
        <AlertCircle size={20} />
        <div className="info-content">
          <h4>Leave Policy Information</h4>
          <ul>
            <li>Casual Leave must be applied at least 5 days in advance</li>
            <li>Earned Leave accumulates monthly at the rate of 1.67 days per month</li>
            <li>Sick Leave does not carry forward to the next financial year</li>
            <li>All leave requests require manager approval</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalance;
