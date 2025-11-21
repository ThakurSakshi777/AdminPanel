import { Search, AlertTriangle, CheckCircle } from 'lucide-react';

const Complaints = () => {
  const complaints = [
    { id: 1, customer: 'Rahul Sharma', property: '3BHK Luxury Apartment', issue: 'Water leakage problem', priority: 'High', date: '2024-11-21', status: 'Open' },
    { id: 2, customer: 'Priya Patel', property: 'Villa with Garden', issue: 'Electricity not working', priority: 'Critical', date: '2024-11-20', status: 'In Progress' },
    { id: 3, customer: 'Amit Kumar', property: '2BHK Modern Flat', issue: 'Door lock broken', priority: 'Medium', date: '2024-11-19', status: 'Resolved' },
    { id: 4, customer: 'Vikram Singh', property: 'Commercial Space', issue: 'AC maintenance required', priority: 'Low', date: '2024-11-18', status: 'Open' },
    { id: 5, customer: 'Sneha Desai', property: '1BHK Studio Apartment', issue: 'Paint peeling off walls', priority: 'Medium', date: '2024-11-17', status: 'In Progress' },
  ];

  const getPriorityColor = (priority) => {
    const colors = {
      'Critical': '#ef4444',
      'High': '#f97316',
      'Medium': '#eab308',
      'Low': '#22c55e'
    };
    return colors[priority] || '#6b7280';
  };

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>Complaints Management</h2>
          <p className="subtitle">Handle customer complaints and issues</p>
        </div>
        <button className="btn-primary-modern">
          <AlertTriangle size={18} />
          New Complaint
        </button>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input type="text" placeholder="Search complaints..." />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Property</th>
              <th>Issue</th>
              <th>Priority</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => (
              <tr key={complaint.id}>
                <td>#{complaint.id}</td>
                <td>{complaint.customer}</td>
                <td>{complaint.property}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <AlertTriangle size={14} />
                    {complaint.issue}
                  </div>
                </td>
                <td>
                  <span 
                    className="badge-priority" 
                    style={{ backgroundColor: getPriorityColor(complaint.priority) + '20', 
                             color: getPriorityColor(complaint.priority) }}
                  >
                    {complaint.priority}
                  </span>
                </td>
                <td>{complaint.date}</td>
                <td>
                  <span className={`badge-status ${complaint.status.toLowerCase().replace(' ', '-')}`}>
                    {complaint.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon success" title="Resolve">
                      <CheckCircle size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Complaints;
