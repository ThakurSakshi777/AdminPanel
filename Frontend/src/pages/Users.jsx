import { useState } from 'react';
import { Search, Plus, Edit, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', role: 'Customer', status: 'Active', phone: '+91 98765 43210', joined: 'Jan 2024' },
    { id: 2, name: 'Priya Patel', email: 'priya@example.com', role: 'Agent', status: 'Active', phone: '+91 98765 43211', joined: 'Feb 2024' },
    { id: 3, name: 'Amit Kumar', email: 'amit@example.com', role: 'Customer', status: 'Inactive', phone: '+91 98765 43212', joined: 'Mar 2024' },
    { id: 4, name: 'Sneha Desai', email: 'sneha@example.com', role: 'Agent', status: 'Active', phone: '+91 98765 43213', joined: 'Apr 2024' },
    { id: 5, name: 'Vikram Singh', email: 'vikram@example.com', role: 'Customer', status: 'Active', phone: '+91 98765 43214', joined: 'May 2024' },
    { id: 6, name: 'Anjali Mehta', email: 'anjali@example.com', role: 'Customer', status: 'Active', phone: '+91 98765 43215', joined: 'Jun 2024' },
    { id: 7, name: 'Rajesh Gupta', email: 'rajesh@example.com', role: 'Agent', status: 'Active', phone: '+91 98765 43216', joined: 'Jul 2024' },
    { id: 8, name: 'Pooja Verma', email: 'pooja@example.com', role: 'Customer', status: 'Inactive', phone: '+91 98765 43217', joined: 'Aug 2024' },
    { id: 9, name: 'Suresh Reddy', email: 'suresh@example.com', role: 'Agent', status: 'Active', phone: '+91 98765 43218', joined: 'Sep 2024' },
    { id: 10, name: 'Kavita Joshi', email: 'kavita@example.com', role: 'Customer', status: 'Active', phone: '+91 98765 43219', joined: 'Oct 2024' },
    { id: 11, name: 'Manoj Yadav', email: 'manoj@example.com', role: 'Customer', status: 'Active', phone: '+91 98765 43220', joined: 'Nov 2024' },
    { id: 12, name: 'Neha Kapoor', email: 'neha@example.com', role: 'Agent', status: 'Active', phone: '+91 98765 43221', joined: 'Nov 2024' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Users per page
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Customer',
    status: 'Active'
  });

  const stats = [
    { label: 'Total Users', value: users.length.toString(), change: '+12%', color: '#0d9488' },
    { label: 'Active Users', value: users.filter(u => u.status === 'Active').length.toString(), change: '+8%', color: '#14b8a6' },
    { label: 'Agents', value: users.filter(u => u.role === 'Agent').length.toString(), change: '+5%', color: '#2dd4bf' },
    { label: 'Customers', value: users.filter(u => u.role === 'Customer').length.toString(), change: '+15%', color: '#5eead4' },
  ];

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'Customer',
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Customer',
      status: 'Active'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingUser) {
      // Update existing user
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...formData }
          : user
      ));
    } else {
      // Add new user
      const newUser = {
        id: users.length + 1,
        ...formData,
        joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      };
      setUsers(prev => [...prev, newUser]);
    }
    
    handleCloseModal();
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to page 1 when search changes
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>Users Management</h2>
          <p className="subtitle">Manage customers and agents</p>
        </div>
        <button className="btn-primary-modern" onClick={() => handleOpenModal()}>
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
        <input 
          type="text" 
          placeholder="Search users by name or email..." 
          value={searchTerm}
          onChange={handleSearch}
        />
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
            {currentUsers.map((user) => (
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
                    <button className="btn-icon-modern edit" onClick={() => handleOpenModal(user)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn-icon-modern delete" onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredUsers.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          
          <div className="pagination-controls">
            <button 
              className="pagination-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            
            <button 
              className="pagination-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role">Role *</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Customer">Customer</option>
                    <option value="Agent">Agent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
