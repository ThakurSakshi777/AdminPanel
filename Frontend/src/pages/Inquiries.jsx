import { useState, useEffect } from 'react';
import { Search, MessageSquare, CheckCircle, X, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllInquiries, createInquiry, updateInquiry, deleteInquiry } from '../services/inquiryService';

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [formData, setFormData] = useState({
    clientName: '',
    contactNumber: '',
    productType: '',
    location: '',
    caseStatus: 'New',
    majorComments: ''
  });

  // Fetch inquiries on component mount
  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await getAllInquiries();
      const inquiriesData = Array.isArray(response) ? response : (response.data || []);
      setInquiries(inquiriesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setError('Failed to load inquiries');
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (inquiry = null) => {
    if (inquiry) {
      setEditingInquiry(inquiry);
      setFormData({
        clientName: inquiry.clientName || '',
        contactNumber: inquiry.contactNumber || '',
        productType: inquiry.productType || '',
        location: inquiry.location || '',
        caseStatus: inquiry.caseStatus || 'New',
        majorComments: inquiry.majorComments || ''
      });
    } else {
      setEditingInquiry(null);
      setFormData({
        clientName: '',
        contactNumber: '',
        productType: '',
        location: '',
        caseStatus: 'New',
        majorComments: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInquiry(null);
    setFormData({
      clientName: '',
      contactNumber: '',
      productType: '',
      location: '',
      caseStatus: 'New',
      majorComments: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingInquiry) {
        await updateInquiry(editingInquiry._id, formData);
      } else {
        await createInquiry(formData);
      }
      handleCloseModal();
      fetchInquiries(); // Refresh list
    } catch (err) {
      console.error('Error saving inquiry:', err);
      alert('Failed to save inquiry: ' + (err.message || 'Unknown error'));
    }
  };

  const handleMarkResolved = async (inquiry) => {
    try {
      await updateInquiry(inquiry._id, { caseStatus: 'Closed' });
      fetchInquiries(); // Refresh list
    } catch (err) {
      console.error('Error updating inquiry:', err);
      alert('Failed to update inquiry status');
    }
  };

  const handleDeleteInquiry = async (inquiryId) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      try {
        await deleteInquiry(inquiryId);
        fetchInquiries(); // Refresh list
      } catch (err) {
        console.error('Error deleting inquiry:', err);
        alert('Failed to delete inquiry');
      }
    }
  };

  const filteredInquiries = inquiries.filter(inquiry =>
    inquiry.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.productType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.majorComments?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const indexOfLastInquiry = currentPage * itemsPerPage;
  const indexOfFirstInquiry = indexOfLastInquiry - itemsPerPage;
  const currentInquiries = filteredInquiries.slice(indexOfFirstInquiry, indexOfLastInquiry);

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

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>Customer Inquiries</h2>
          <p className="subtitle">Manage customer queries and requests</p>
        </div>
        <button className="btn-primary-modern" onClick={() => handleOpenModal()}>
          <MessageSquare size={18} />
          New Inquiry
        </button>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input 
          type="text" 
          placeholder="Search inquiries..." 
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading inquiries...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          <p>{error}</p>
          <button onClick={fetchInquiries} className="btn-primary-modern" style={{ marginTop: '10px' }}>
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client Name</th>
                  <th>Contact</th>
                  <th>Product Type</th>
                  <th>Location</th>
                  <th>Comments</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentInquiries.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>
                      No inquiries found
                    </td>
                  </tr>
                ) : (
                  currentInquiries.map((inquiry, index) => (
                    <tr key={inquiry._id || index}>
                      <td>#{inquiry.s_No || (index + 1)}</td>
                      <td>{inquiry.clientName || 'N/A'}</td>
                      <td>{inquiry.contactNumber || 'N/A'}</td>
                      <td>{inquiry.productType || 'N/A'}</td>
                      <td>{inquiry.location || 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <MessageSquare size={14} />
                          {inquiry.majorComments || 'N/A'}
                        </div>
                      </td>
                      <td>{inquiry.date ? new Date(inquiry.date).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <span className={`badge-status ${inquiry.caseStatus?.toLowerCase() || 'new'}`}>
                          {inquiry.caseStatus || 'New'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-modern">
                          <button 
                            className="btn-icon-modern success" 
                            title="Mark as Resolved"
                            onClick={() => handleMarkResolved(inquiry)}
                            disabled={inquiry.caseStatus === 'Closed'}
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            className="btn-icon-modern edit" 
                            title="Edit Inquiry"
                            onClick={() => handleOpenModal(inquiry)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="btn-icon-modern delete" 
                            title="Delete Inquiry"
                            onClick={() => handleDeleteInquiry(inquiry._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredInquiries.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstInquiry + 1} to {Math.min(indexOfLastInquiry, filteredInquiries.length)} of {filteredInquiries.length} inquiries
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
        </>
      )}

      {/* Add New Inquiry Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingInquiry ? 'Edit Inquiry' : 'New Inquiry'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="clientName">Client Name *</label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactNumber">Contact Number *</label>
                <input
                  type="text"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="Enter contact number"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="productType">Product Type *</label>
                <input
                  type="text"
                  id="productType"
                  name="productType"
                  value={formData.productType}
                  onChange={handleInputChange}
                  placeholder="Enter product type"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter location"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="majorComments">Comments *</label>
                <textarea
                  id="majorComments"
                  name="majorComments"
                  value={formData.majorComments}
                  onChange={handleInputChange}
                  placeholder="Enter major comments..."
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

              <div className="form-group">
                <label htmlFor="caseStatus">Status *</label>
                <select
                  id="caseStatus"
                  name="caseStatus"
                  value={formData.caseStatus}
                  onChange={handleInputChange}
                  required
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingInquiry ? 'Update Inquiry' : 'Add Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inquiries;
