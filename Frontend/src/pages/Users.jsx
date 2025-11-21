import { Search, Plus, Edit, Trash2, UserCircle, Mail, Shield } from 'lucide-react';

const Users = () => {
  const users = [
    { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', role: 'Customer', status: 'Active', phone: '+91 98765 43210', joined: 'Jan 2024' },
    { id: 2, name: 'Priya Patel', email: 'priya@example.com', role: 'Agent', status: 'Active', phone: '+91 98765 43211', joined: 'Feb 2024' },
    { id: 3, name: 'Amit Kumar', email: 'amit@example.com', role: 'Customer', status: 'Inactive', phone: '+91 98765 43212', joined: 'Mar 2024' },
    { id: 4, name: 'Sneha Desai', email: 'sneha@example.com', role: 'Agent', status: 'Active', phone: '+91 98765 43213', joined: 'Apr 2024' },
    { id: 5, name: 'Vikram Singh', email: 'vikram@example.com', role: 'Customer', status: 'Active', phone: '+91 98765 43214', joined: 'May 2024' },
  ];

  const stats = [
    { label: 'Total Users', value: '1,234', change: '+12%', color: '#0d9488' },
    { label: 'Active Users', value: '856', change: '+8%', color: '#14b8a6' },
    { label: 'Agents', value: '124', change: '+5%', color: '#2dd4bf' },
    { label: 'Customers', value: '1,110', change: '+15%', color: '#5eead4' },
  ];

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>Users Management</h2>
          <p className="subtitle">Manage customers and agents</p>
        </div>
        <button className="btn-primary-modern">
          <Plus size={18} />
          Add New User
        </button>
      </div>

      <div className="stats-row">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card-modern" style={{ borderTopColor: stat.color }}>
            <p className="stat-label-modern">{stat.label}</p>
            <h3 className="stat-value-modern">{stat.value}</h3>
            <span className="stat-change-modern positive">{stat.change}</span>
          </div>
        ))}
      </div>

      <div className="search-bar-modern">
        <Search size={20} />
        <input type="text" placeholder="Search users by name or email..." />
      </div>

      <div className="table-container-modern">
        <table className="data-table-modern">
          <thead>
            <tr>
              <th>USER</th>
              <th>CONTACT</th>
              <th>ROLE</th>
              <th>JOINED</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">{user.name.charAt(0)}</div>
                    <div>
                      <p className="user-name">{user.name}</p>
                      <p className="user-id">#{user.id}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p className="contact-email">{user.email}</p>
                  <p className="contact-phone">{user.phone}</p>
                </td>
                <td><span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span></td>
                <td className="joined-col">{user.joined}</td>
                <td>
                  <span className={`status-badge-modern ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons-modern">
                    <button className="btn-icon-modern edit"><Edit size={16} /></button>
                    <button className="btn-icon-modern delete"><Trash2 size={16} /></button>
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

export default Users;
