import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Wrench, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllServices, addService, deleteMainService } from '../services/serviceService';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [formData, setFormData] = useState({
    mainService: '',
    typeName: '',
    baseCharges1BHK: '',
    baseCharges2BHK: '',
    baseCharges3BHK: '',
    baseCharges4BHK: '',
    distanceRatePerKm: '10'
  });

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllServices();
      
      // Check if response has success flag
      if (response.data && response.data.success !== false) {
        setServices(response.data.data || response.data || []);
      } else {
        // If success is false but it's just "no services found", show empty array
        setServices([]);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      // If 404 error (no services found), show empty array instead of error
      if (err.response && err.response.status === 404) {
        setServices([]);
        setError(null);
      } else {
        setError('Failed to load services. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        mainService: service.mainService || '',
        typeName: '',
        baseCharges1BHK: '',
        baseCharges2BHK: '',
        baseCharges3BHK: '',
        baseCharges4BHK: '',
        distanceRatePerKm: '10'
      });
    } else {
      setEditingService(null);
      setFormData({
        mainService: '',
        typeName: '',
        baseCharges1BHK: '',
        baseCharges2BHK: '',
        baseCharges3BHK: '',
        baseCharges4BHK: '',
        distanceRatePerKm: '10'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({
      mainService: '',
      typeName: '',
      baseCharges1BHK: '',
      baseCharges2BHK: '',
      baseCharges3BHK: '',
      baseCharges4BHK: '',
      distanceRatePerKm: '10'
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
      // Format data for backend
      const serviceData = {
        mainService: formData.mainService,
        typeName: formData.typeName,
        adminConfig: {
          baseCharges: {
            '1 BHK': Number(formData.baseCharges1BHK) || 0,
            '2 BHK': Number(formData.baseCharges2BHK) || 0,
            '3 BHK': Number(formData.baseCharges3BHK) || 0,
            '4+ BHK': Number(formData.baseCharges4BHK) || 0,
            'Small': 0,
            'Medium': 0,
            'Large': 0,
            'Single Room': 0,
            'Shared Room': 0,
            'Entire Floor': 0
          },
          distanceRatePerKm: Number(formData.distanceRatePerKm) || 10
        }
      };
      
      // Always use addService API - it handles both new service and adding type to existing service
      await addService(serviceData);
      await fetchServices();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving service:', err);
      alert(err.response?.data?.message || 'Failed to save service. Please try again.');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteMainService(serviceId);
        await fetchServices();
      } catch (err) {
        console.error('Error deleting service:', err);
        alert('Failed to delete service. Please try again.');
      }
    }
  };

  const filteredServices = services.filter(service =>
    (service.mainService || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentServices = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>Services Management</h2>
          <p className="subtitle">Manage additional services offered</p>
        </div>
        <button className="btn-primary-modern" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Add New Service
        </button>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input 
          type="text" 
          placeholder="Search services..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          Loading services...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ color: '#ef4444', marginBottom: '15px' }}>{error}</p>
          <button className="btn-primary-modern" onClick={fetchServices}>
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
                  <th>Main Service</th>
                  <th>Service Types</th>
                  <th>Total Requests</th>
                  <th>Distance Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentServices.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                      No services found
                    </td>
                  </tr>
                ) : (
                  currentServices.map((service, index) => (
                    <tr key={service._id || service.id}>
                      <td>#{indexOfFirstItem + index + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Wrench size={16} />
                          <strong>{service.mainService}</strong>
                        </div>
                      </td>
                      <td>
                        {service.serviceTypes && service.serviceTypes.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {service.serviceTypes.map((type, idx) => (
                              <span key={idx} className="badge-role" style={{ fontSize: '11px' }}>
                                {type.typeName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td>
                        {service.serviceTypes?.reduce((total, type) => total + (type.requests?.length || 0), 0) || 0} requests
                      </td>
                      <td>
                        ₹{service.serviceTypes?.[0]?.adminConfig?.distanceRatePerKm || 10}/km
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" onClick={() => handleOpenModal(service)}>
                            <Edit size={16} />
                          </button>
                          <button className="btn-icon danger" onClick={() => handleDeleteService(service._id || service.id)}>
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
          {filteredServices.length > itemsPerPage && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={handlePrevious}
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
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button 
                className="pagination-btn"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          <div className="pagination-info">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredServices.length)} of {filteredServices.length} services
          </div>
        </>
      )}

      {/* Add/Edit Service Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingService ? 'Add Service Type to ' + formData.mainService : 'Add New Service'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="mainService">Main Service Name *</label>
                <input
                  type="text"
                  id="mainService"
                  name="mainService"
                  value={formData.mainService}
                  onChange={handleInputChange}
                  placeholder="e.g., Cleaning, Plumbing, Painting"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="typeName">Service Type *</label>
                <input
                  type="text"
                  id="typeName"
                  name="typeName"
                  value={formData.typeName}
                  onChange={handleInputChange}
                  placeholder="e.g., Office, Apartment, Villa"
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ marginBottom: '10px', display: 'block' }}>Base Charges by Property Size</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <input
                      type="number"
                      name="baseCharges1BHK"
                      value={formData.baseCharges1BHK}
                      onChange={handleInputChange}
                      placeholder="1 BHK (₹)"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="baseCharges2BHK"
                      value={formData.baseCharges2BHK}
                      onChange={handleInputChange}
                      placeholder="2 BHK (₹)"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="baseCharges3BHK"
                      value={formData.baseCharges3BHK}
                      onChange={handleInputChange}
                      placeholder="3 BHK (₹)"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="baseCharges4BHK"
                      value={formData.baseCharges4BHK}
                      onChange={handleInputChange}
                      placeholder="4+ BHK (₹)"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="distanceRatePerKm">Distance Rate per KM (₹) *</label>
                <input
                  type="number"
                  id="distanceRatePerKm"
                  name="distanceRatePerKm"
                  value={formData.distanceRatePerKm}
                  onChange={handleInputChange}
                  placeholder="e.g., 10"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingService ? 'Update Service' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
