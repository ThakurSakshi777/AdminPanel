import { useState } from 'react';
import { Search, MessageSquare, CheckCircle, X } from 'lucide-react';

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([
    { id: 1, customer: 'Rahul Sharma', property: '3BHK Luxury Apartment', message: 'Interested in visiting', date: '2024-11-21', status: 'New' },
    { id: 2, customer: 'Amit Kumar', property: 'Villa with Garden', message: 'Want to know about pricing', date: '2024-11-20', status: 'Replied' },
    { id: 3, customer: 'Vikram Singh', property: '2BHK Modern Flat', message: 'Is loan facility available?', date: '2024-11-19', status: 'New' },
    { id: 4, customer: 'Neha Gupta', property: 'Commercial Space', message: 'Need complete details', date: '2024-11-18', status: 'Closed' },
    { id: 5, customer: 'Ravi Verma', property: '1BHK Studio Apartment', message: 'Schedule a visit', date: '2024-11-21', status: 'New' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    customer: '',
    property: '',
    message: '',
    status: 'New'
  });

  const handleOpenModal = () => {
    setFormData({
      customer: '',
      property: '',
      message: '',
      status: 'New'
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      customer: '',
      property: '',
      message: '',
      status: 'New'
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
    
    const newInquiry = {
      id: inquiries.length + 1,
      ...formData,
      date: new Date().toISOString().split('T')[0]
    };
    setInquiries(prev => [...prev, newInquiry]);
    
    handleCloseModal();
  };

  const handleMarkResolved = (inquiryId) => {
    setInquiries(prev => prev.map(inquiry => 
      inquiry.id === inquiryId 
        ? { ...inquiry, status: 'Closed' }
        : inquiry
    ));
  };

  const filteredInquiries = inquiries.filter(inquiry =>
    inquiry.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>Customer Inquiries</h2>
          <p className="subtitle">Manage customer queries and requests</p>
        </div>
        <button className="btn-primary-modern" onClick={handleOpenModal}>
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
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
            {filteredInquiries.map((inquiry) => (
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
                    <button 
                      className="btn-icon success" 
                      title="Mark as Resolved"
                      onClick={() => handleMarkResolved(inquiry.id)}
                      disabled={inquiry.status === 'Closed'}
                    >
                      <CheckCircle size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New Inquiry Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Inquiry</h3>
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
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Enter inquiry message..."
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
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="New">New</option>
                  <option value="Replied">Replied</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add Inquiry
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
