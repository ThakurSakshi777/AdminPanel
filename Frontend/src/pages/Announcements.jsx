import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Bell, X, ChevronLeft, ChevronRight, Calendar, User, Clock } from 'lucide-react';
import { getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, publishAnnouncement } from '../services/hrService';
import { useAuth } from '../context/useAuth';

const Announcements = () => {
  const { userRole } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Published');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    expiryDate: '',
    status: 'Draft',
    audience: 'All Employees',
    priority: 'Medium'
  });

  const audiences = ['All Employees', 'Development', 'HR', 'Sales', 'Finance', 'Operations', 'Management'];

  useEffect(() => {
    fetchAnnouncements();
  }, [statusFilter]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const filters = statusFilter ? { status: statusFilter } : {};
      const data = await getAllAnnouncements(filters);
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        expiryDate: announcement.expiryDate.split('T')[0],
        status: announcement.status,
        audience: announcement.audience,
        priority: announcement.priority || 'Medium'
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: '',
        content: '',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Draft',
        audience: 'All Employees',
        priority: 'Medium'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAnnouncement(null);
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
    
    if (!formData.title || !formData.content || !formData.expiryDate) {
      alert('Please fill all required fields');
      return;
    }

    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement._id, formData);
      } else {
        await createAnnouncement(formData);
      }
      fetchAnnouncements();
      handleCloseModal();
    } catch (error) {
      alert('Error saving announcement: ' + error.message);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await deleteAnnouncement(id);
        fetchAnnouncements();
      } catch (error) {
        alert('Error deleting announcement: ' + error.message);
      }
    }
  };

  const handlePublish = async (id) => {
    try {
      await publishAnnouncement(id);
      fetchAnnouncements();
    } catch (error) {
      alert('Error publishing announcement: ' + error.message);
    }
  };

  let filteredAnnouncements = announcements.filter(ann =>
    ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ann.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAnnouncements = filteredAnnouncements.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Published': return 'success';
      case 'Draft': return 'warning';
      case 'Archived': return 'secondary';
      default: return 'secondary';
    }
  };

  const getAudienceColor = (audience) => {
    switch(audience) {
      case 'All Employees': return '#4f46e5';
      case 'Development': return '#3b82f6';
      case 'HR': return '#8b5cf6';
      case 'Sales': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Urgent': return '#ef4444';
      case 'High': return '#f97316';
      case 'Medium': return '#eab308';
      case 'Low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const publishedCount = announcements.filter(a => a.status === 'Published').length;
  const draftCount = announcements.filter(a => a.status === 'Draft').length;
  const totalAnnouncements = announcements.length;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading announcements...</div>;
  }

  if (userRole !== 'hr' && userRole !== 'admin') {
    return (
      <div className="page-container">
        <div className="page-header-modern">
          <div>
            <h2>Company Announcements</h2>
            <p className="subtitle">View important updates and notices</p>
          </div>
        </div>
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          color: '#666'
        }}>
          <p>This page is for HR only. Visit the Employee Announcements section to view company announcements.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>Company Announcements</h2>
          <p className="subtitle">Communicate important updates and notices to employees</p>
        </div>
        <button className="btn-primary-modern" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Create Announcement
        </button>
      </div>

      <div className="filters-section">
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Bell size={24} />
          </div>
          <div className="stat-content">
            <h4>Total Announcements</h4>
            <p className="stat-number">{totalAnnouncements}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h4>Published</h4>
            <p className="stat-number">{publishedCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Edit size={24} />
          </div>
          <div className="stat-content">
            <h4>Draft</h4>
            <p className="stat-number">{draftCount}</p>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {currentAnnouncements.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#666'
          }}>
            <Bell size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <p>No announcements found</p>
          </div>
        ) : (
          currentAnnouncements.map((announcement) => (
            <div key={announcement._id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '20px',
              borderLeft: `4px solid ${getAudienceColor(announcement.audience)}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                    {announcement.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#666' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={14} /> {announcement.createdByName || 'Unknown'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> Expires: {new Date(announcement.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={`badge-status ${getStatusColor(announcement.status)}`}>
                    {announcement.status}
                  </span>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    backgroundColor: getAudienceColor(announcement.audience) + '20',
                    color: getAudienceColor(announcement.audience),
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {announcement.audience}
                  </span>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    backgroundColor: getPriorityColor(announcement.priority) + '20',
                    color: getPriorityColor(announcement.priority),
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {announcement.priority || 'Medium'}
                  </span>
                </div>
              </div>

              <p style={{ 
                margin: '12px 0', 
                lineHeight: '1.6', 
                color: '#555',
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px'
              }}>
                {announcement.content}
              </p>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                {announcement.status === 'Draft' && (
                  <button 
                    className="btn-secondary-modern"
                    onClick={() => handlePublish(announcement._id)}
                    style={{ fontSize: '13px', padding: '6px 12px' }}
                  >
                    Publish
                  </button>
                )}
                <button 
                  className="btn-icon"
                  onClick={() => handleOpenModal(announcement)}
                  style={{ fontSize: '13px' }}
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="btn-icon danger"
                  onClick={() => handleDeleteAnnouncement(announcement._id)}
                  style={{ fontSize: '13px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredAnnouncements.length > itemsPerPage && (
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
        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAnnouncements.length)} of {filteredAnnouncements.length} announcements
      </div>

      {/* Create/Edit Announcement Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="title">Announcement Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter announcement title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Content *</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Enter announcement content"
                  rows="6"
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="audience">Target Audience</label>
                  <select
                    id="audience"
                    name="audience"
                    value={formData.audience}
                    onChange={handleInputChange}
                  >
                    {audiences.map(aud => (
                      <option key={aud} value={aud}>{aud}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date *</label>
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
