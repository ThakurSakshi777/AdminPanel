import { Search, Eye, CheckCircle, XCircle } from 'lucide-react';

const Listings = () => {
  const listings = [
    { id: 1, property: '3BHK Luxury Apartment', agent: 'Priya Patel', date: '2024-11-15', views: 145, status: 'Active' },
    { id: 2, property: '2BHK Modern Flat', agent: 'Sneha Desai', date: '2024-11-10', views: 89, status: 'Pending' },
    { id: 3, property: 'Villa with Garden', agent: 'Priya Patel', date: '2024-11-18', views: 234, status: 'Active' },
    { id: 4, property: 'Commercial Space', agent: 'Rahul Sharma', date: '2024-11-12', views: 67, status: 'Rejected' },
    { id: 5, property: '1BHK Studio Apartment', agent: 'Sneha Desai', date: '2024-11-20', views: 23, status: 'Pending' },
  ];

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>Listings Management</h2>
          <p className="subtitle">Review and approve property listings</p>
        </div>
        <div className="header-actions">
          <button className="filter-btn-modern">⚙ Filter</button>
          <button className="filter-btn-modern">↕ Sort</button>
        </div>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input type="text" placeholder="Search listings..." />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Property</th>
              <th>Listed By</th>
              <th>Date</th>
              <th>Views</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id}>
                <td>#{listing.id}</td>
                <td>{listing.property}</td>
                <td>{listing.agent}</td>
                <td>{listing.date}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Eye size={14} />
                    {listing.views}
                  </div>
                </td>
                <td>
                  <span className={`badge-status ${listing.status.toLowerCase()}`}>
                    {listing.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon success" title="Approve">
                      <CheckCircle size={16} />
                    </button>
                    <button className="btn-icon danger" title="Reject">
                      <XCircle size={16} />
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

export default Listings;
