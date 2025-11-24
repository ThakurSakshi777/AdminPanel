import { useState, useRef } from 'react';
import { Search, Plus, Edit, Trash2, MapPin, Home, Building2, TrendingUp, X, Upload, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const Properties = () => {
  const fileInputRef = useRef(null);
  const [properties, setProperties] = useState([
    { id: 1, title: '3BHK Luxury Apartment', location: 'Mumbai, Maharashtra', price: '₹1.2 Cr', type: 'Apartment', status: 'Available', beds: 3, baths: 2, sqft: '1,450', images: [] },
    { id: 2, title: '2BHK Modern Flat', location: 'Pune, Maharashtra', price: '₹75 Lac', type: 'Flat', status: 'Sold', beds: 2, baths: 2, sqft: '1,100', images: [] },
    { id: 3, title: 'Villa with Garden', location: 'Bangalore, Karnataka', price: '₹2.5 Cr', type: 'Villa', status: 'Available', beds: 4, baths: 3, sqft: '2,800', images: [] },
    { id: 4, title: 'Commercial Space', location: 'Delhi, NCR', price: '₹5 Cr', type: 'Commercial', status: 'Available', beds: '-', baths: 4, sqft: '5,000', images: [] },
    { id: 5, title: '1BHK Studio Apartment', location: 'Gurgaon, Haryana', price: '₹45 Lac', type: 'Apartment', status: 'Available', beds: 1, baths: 1, sqft: '650', images: [] },
    { id: 6, title: '4BHK Penthouse', location: 'Mumbai, Maharashtra', price: '₹3.5 Cr', type: 'Apartment', status: 'Available', beds: 4, baths: 3, sqft: '2,200', images: [] },
    { id: 7, title: 'Office Space', location: 'Noida, UP', price: '₹2 Cr', type: 'Commercial', status: 'Available', beds: '-', baths: 2, sqft: '3,000', images: [] },
    { id: 8, title: '3BHK Sea View Flat', location: 'Chennai, Tamil Nadu', price: '₹1.8 Cr', type: 'Flat', status: 'Available', beds: 3, baths: 2, sqft: '1,600', images: [] },
    { id: 9, title: 'Independent House', location: 'Jaipur, Rajasthan', price: '₹95 Lac', type: 'Villa', status: 'Sold', beds: 3, baths: 2, sqft: '1,800', images: [] },
    { id: 10, title: 'Retail Shop', location: 'Kolkata, West Bengal', price: '₹80 Lac', type: 'Commercial', status: 'Available', beds: '-', baths: 1, sqft: '800', images: [] },
    { id: 11, title: '2BHK Garden Apartment', location: 'Hyderabad, Telangana', price: '₹90 Lac', type: 'Apartment', status: 'Available', beds: 2, baths: 2, sqft: '1,200', images: [] },
    { id: 12, title: 'Luxury Villa', location: 'Goa', price: '₹5 Cr', type: 'Villa', status: 'Available', beds: 5, baths: 4, sqft: '3,500', images: [] },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Properties per page
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    type: 'Apartment',
    status: 'Available',
    beds: '',
    baths: '',
    sqft: '',
    images: []
  });

  const handleOpenModal = (property = null) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        title: property.title,
        location: property.location,
        price: property.price,
        type: property.type,
        status: property.status,
        beds: property.beds,
        baths: property.baths,
        sqft: property.sqft,
        images: property.images || []
      });
      setUploadedImages(property.images || []);
    } else {
      setEditingProperty(null);
      setFormData({
        title: '',
        location: '',
        price: '',
        type: 'Apartment',
        status: 'Available',
        beds: '',
        baths: '',
        sqft: '',
        images: []
      });
      setUploadedImages([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProperty(null);
    setUploadedImages([]);
    setFormData({
      title: '',
      location: '',
      price: '',
      type: 'Apartment',
      status: 'Available',
      beds: '',
      baths: '',
      sqft: '',
      images: []
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;

    if (uploadedImages.length + files.length > maxFiles) {
      alert(`You can only upload maximum ${maxFiles} images`);
      return;
    }

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedImages(prev => [...prev, reader.result]);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, reader.result]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingProperty) {
      setProperties(prev => prev.map(property => 
        property.id === editingProperty.id 
          ? { ...property, ...formData }
          : property
      ));
    } else {
      const newProperty = {
        id: properties.length + 1,
        ...formData
      };
      setProperties(prev => [...prev, newProperty]);
    }
    
    handleCloseModal();
  };

  const handleDeleteProperty = (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      setProperties(prev => prev.filter(property => property.id !== propertyId));
    }
  };

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const indexOfLastProperty = currentPage * itemsPerPage;
  const indexOfFirstProperty = indexOfLastProperty - itemsPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);

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

  // Calculate dynamic stats from properties data
  const totalProperties = properties.length;
  const availableProperties = properties.filter(p => p.status === 'Available').length;
  const soldProperties = properties.filter(p => p.status === 'Sold').length;
  
  // Calculate total revenue from sold properties
  const calculateRevenue = () => {
    const soldProps = properties.filter(p => p.status === 'Sold');
    let totalRevenue = 0;
    
    soldProps.forEach(prop => {
      const priceStr = prop.price.replace('₹', '').trim();
      let value = 0;
      
      if (priceStr.includes('Cr')) {
        value = parseFloat(priceStr.replace('Cr', '').trim()) * 10000000;
      } else if (priceStr.includes('Lac')) {
        value = parseFloat(priceStr.replace('Lac', '').trim()) * 100000;
      }
      
      totalRevenue += value;
    });
    
    // Format revenue
    if (totalRevenue >= 10000000) {
      return `₹${(totalRevenue / 10000000).toFixed(1)} Cr`;
    } else if (totalRevenue >= 100000) {
      return `₹${(totalRevenue / 100000).toFixed(0)} Lac`;
    }
    return `₹${totalRevenue}`;
  };

  const stats = [
    { label: 'Total Properties', value: totalProperties.toString(), icon: Home, color: '#0d9488' },
    { label: 'Available', value: availableProperties.toString(), icon: Building2, color: '#14b8a6' },
    { label: 'Sold', value: soldProperties.toString(), icon: TrendingUp, color: '#2dd4bf' },
    { label: 'Revenue', value: calculateRevenue(), icon: TrendingUp, color: '#5eead4' },
  ];

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>Properties Management</h2>
          <p className="subtitle">Add and manage property listings</p>
        </div>
        <button className="btn-primary-modern" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Add New Property
        </button>
      </div>

      <div className="stats-row">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card-modern" style={{ borderTopColor: stat.color }}>
              <div className="stat-icon-modern" style={{ backgroundColor: stat.color + '20' }}>
                <Icon size={20} color={stat.color} />
              </div>
              <p className="stat-label-modern">{stat.label}</p>
              <h3 className="stat-value-modern">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="search-bar-modern">
        <Search size={20} />
        <input 
          type="text" 
          placeholder="Search properties by title or location..." 
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="table-container-modern">
        <table className="data-table-modern">
          <thead>
            <tr>
              <th>PROPERTY</th>
              <th>LOCATION</th>
              <th>DETAILS</th>
              <th>PRICE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentProperties.map((property) => (
              <tr key={property.id}>
                <td>
                  <div className="property-cell">
                    <div className="property-icon">🏠</div>
                    <div>
                      <p className="property-title">{property.title}</p>
                      <p className="property-type">{property.type}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="location-cell">
                    <MapPin size={14} />
                    {property.location}
                  </div>
                </td>
                <td>
                  <div className="details-cell">
                    <span>{property.beds} Beds</span> • <span>{property.baths} Baths</span> • <span>{property.sqft} sqft</span>
                  </div>
                </td>
                <td><strong className="price-col">{property.price}</strong></td>
                <td>
                  <span className={`status-badge-modern ${property.status.toLowerCase()}`}>
                    {property.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons-modern">
                    <button className="btn-icon-modern edit" onClick={() => handleOpenModal(property)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn-icon-modern delete" onClick={() => handleDeleteProperty(property.id)}>
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
      {filteredProperties.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {indexOfFirstProperty + 1} to {Math.min(indexOfLastProperty, filteredProperties.length)} of {filteredProperties.length} properties
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

      {/* Add/Edit Property Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProperty ? 'Edit Property' : 'Add New Property'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="title">Property Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., 3BHK Luxury Apartment"
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
                  placeholder="e.g., Mumbai, Maharashtra"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price *</label>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g., ₹1.2 Cr"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Property Type *</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Flat">Flat</option>
                    <option value="Villa">Villa</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Plot">Plot</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="beds">Bedrooms *</label>
                  <input
                    type="text"
                    id="beds"
                    name="beds"
                    value={formData.beds}
                    onChange={handleInputChange}
                    placeholder="e.g., 3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="baths">Bathrooms *</label>
                  <input
                    type="text"
                    id="baths"
                    name="baths"
                    value={formData.baths}
                    onChange={handleInputChange}
                    placeholder="e.g., 2"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sqft">Area (sqft) *</label>
                  <input
                    type="text"
                    id="sqft"
                    name="sqft"
                    value={formData.sqft}
                    onChange={handleInputChange}
                    placeholder="e.g., 1,450"
                    required
                  />
                </div>
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
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                  <option value="Rented">Rented</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>

              {/* Image Upload Section */}
              <div className="form-group">
                <label>Property Images (Max 5)</label>
                <div className="image-upload-section">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="btn-upload-image"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadedImages.length >= 5}
                  >
                    <Upload size={18} />
                    {uploadedImages.length === 0 ? 'Upload Images' : `Add More (${uploadedImages.length}/5)`}
                  </button>
                  
                  {uploadedImages.length > 0 && (
                    <div className="uploaded-images-grid">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="uploaded-image-item">
                          <img src={image} alt={`Property ${index + 1}`} />
                          <button
                            type="button"
                            className="btn-remove-image"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X size={16} />
                          </button>
                          {index === 0 && <span className="primary-badge">Primary</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {uploadedImages.length === 0 && (
                    <div className="image-upload-placeholder">
                      <ImageIcon size={40} />
                      <p>No images uploaded yet</p>
                      <span>Click above to upload property images</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingProperty ? 'Update Property' : 'Add Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;
