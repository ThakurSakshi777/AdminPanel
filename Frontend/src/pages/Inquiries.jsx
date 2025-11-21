import { Search, MessageSquare, CheckCircle } from 'lucide-react';

const Inquiries = () => {
  const inquiries = [
    { id: 1, customer: 'Rahul Sharma', property: '3BHK Luxury Apartment', message: 'Interested in visiting', date: '2024-11-21', status: 'New' },
    { id: 2, customer: 'Amit Kumar', property: 'Villa with Garden', message: 'Want to know about pricing', date: '2024-11-20', status: 'Replied' },
    { id: 3, customer: 'Vikram Singh', property: '2BHK Modern Flat', message: 'Is loan facility available?', date: '2024-11-19', status: 'New' },
    { id: 4, customer: 'Neha Gupta', property: 'Commercial Space', message: 'Need complete details', date: '2024-11-18', status: 'Closed' },
    { id: 5, customer: 'Ravi Verma', property: '1BHK Studio Apartment', message: 'Schedule a visit', date: '2024-11-21', status: 'New' },
  ];

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>Customer Inquiries</h2>
          <p className="subtitle">Manage customer queries and requests</p>
        </div>
        <button className="btn-primary-modern">
          <MessageSquare size={18} />
          New Inquiry
        </button>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input type="text" placeholder="Search inquiries..." />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Property</th>
              <th>Message</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id}>
                <td>#{inquiry.id}</td>
                <td>{inquiry.customer}</td>
                <td>{inquiry.property}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MessageSquare size={14} />
                    {inquiry.message}
                  </div>
                </td>
                <td>{inquiry.date}</td>
                <td>
                  <span className={`badge-status ${inquiry.status.toLowerCase()}`}>
                    {inquiry.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon success" title="Mark as Resolved">
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

export default Inquiries;
