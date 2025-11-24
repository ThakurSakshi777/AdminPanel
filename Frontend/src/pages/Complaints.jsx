import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, X, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const Complaints = () => {
  const [complaints, setComplaints] = useState([
    { id: 1, customer: 'Rahul Sharma', property: '3BHK Luxury Apartment', issue: 'Water leakage problem', priority: 'High', date: '2024-11-21', status: 'Open' },
    { id: 2, customer: 'Priya Patel', property: 'Villa with Garden', issue: 'Electricity not working', priority: 'Critical', date: '2024-11-20', status: 'In Progress' },
    { id: 3, customer: 'Amit Kumar', property: '2BHK Modern Flat', issue: 'Door lock broken', priority: 'Medium', date: '2024-11-19', status: 'Resolved' },
    { id: 4, customer: 'Vikram Singh', property: 'Commercial Space', issue: 'AC maintenance required', priority: 'Low', date: '2024-11-18', status: 'Open' },
    { id: 5, customer: 'Sneha Desai', property: '1BHK Studio Apartment', issue: 'Paint peeling off walls', priority: 'Medium', date: '2024-11-17', status: 'In Progress' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [formData, setFormData] = useState({
    customer: '',
    property: '',
    issue: '',
    priority: 'Medium',
    status: 'Open'
  });

  const handleOpenModal = (complaint = null) => {
    if (complaint) {
      setEditingComplaint(complaint);
      setFormData({
        customer: complaint.customer,
        property: complaint.property,
        issue: complaint.issue,
        priority: complaint.priority,
        status: complaint.status
      });
    } else {
      setEditingComplaint(null);
      setFormData({
        customer: '',
        property: '',
        issue: '',
        priority: 'Medium',
        status: 'Open'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingComplaint(null);
    setFormData({
      customer: '',
      property: '',
      issue: '',
      priority: 'Medium',
      status: 'Open'
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
    
    if (editingComplaint) {
      setComplaints(prev => prev.map(complaint => 
        complaint.id === editingComplaint.id 
          ? { ...complaint, ...formData }
          : complaint
      ));
    } else {
      const newComplaint = {
        id: complaints.length + 1,
        ...formData,
        date: new Date().toISOString().split('T')[0]
      };
      setComplaints(prev => [...prev, newComplaint]);
    }
    
    handleCloseModal();
  };

  const handleResolve = (complaintId) => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, status: 'Resolved' }
        : complaint
    ));
  };

  const handleDeleteComplaint = (complaintId) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      setComplaints(prev => prev.filter(complaint => complaint.id !== complaintId));
    }
  };

  const filteredComplaints = complaints.filter(complaint =>
    complaint.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.issue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const indexOfLastComplaint = currentPage * itemsPerPage;
  const indexOfFirstComplaint = indexOfLastComplaint - itemsPerPage;
  const currentComplaints = filteredComplaints.slice(indexOfFirstComplaint, indexOfLastComplaint);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Reset to page 1 when search changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

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
        <button className="btn-primary-modern" onClick={handleOpenModal}>
          <AlertTriangle size={18} />
          New Complaint
        </button>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input 
          type="text" 
          placeholder="Search complaints..." 
          value={searchTerm}
          onChange={handleSearchChange}
        />
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
            {currentComplaints.map((complaint) => (
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
                  <div className="action-buttons-modern">
                    <button 
                      className="btn-icon-modern success" 
                      title="Resolve"
                      onClick={() => handleResolve(complaint.id)}
                      disabled={complaint.status === 'Resolved'}
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button 
                      className="btn-icon-modern edit" 
                      title="Edit Complaint"
                      onClick={() => handleOpenModal(complaint)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon-modern delete" 
                      title="Delete Complaint"
                      onClick={() => handleDeleteComplaint(complaint.id)}
                    >
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
      {filteredComplaints.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {indexOfFirstComplaint + 1} to {Math.min(indexOfLastComplaint, filteredComplaints.length)} of {filteredComplaints.length} complaints
          </div>
          
          <div className="pagination-controls">
            <button 
              className="pagination-btn" 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            
            <button 
              className="pagination-btn" 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Add New Complaint Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingComplaint ? 'Edit Complaint' : 'New Complaint'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="customer">Customer Name *</label>
                <input
                  type="text"
                  id="customer"
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="property">Property *</label>
                <input
                  type="text"
                  id="property"
                  name="property"
                  value={formData.property}
                  onChange={handleInputChange}
                  placeholder="Enter property name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="issue">Issue Description *</label>
                <textarea
                  id="issue"
                  name="issue"
                  value={formData.issue}
                  onChange={handleInputChange}
                  placeholder="Describe the issue..."
                  rows="4"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Priority *</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
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
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingComplaint ? 'Update Complaint' : 'Add Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
