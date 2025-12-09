import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Star, X, ChevronLeft, ChevronRight, TrendingUp, Award, User } from 'lucide-react';
import { getAllPerformance, updateEmployeeRating, getEmployees } from '../services/hrService';

const Performance = () => {
  const [performances, setPerformances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerformance, setEditingPerformance] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    rating: 3,
    feedback: '',
    strengths: '',
    areasForImprovement: '',
    achievements: '',
    skills: ''
  });

  // Fetch performance data and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch employees for dropdown
        const empRes = await getEmployees();
        if (empRes.success && empRes.data) {
          setEmployees(empRes.data);
        }

        // Fetch performance data
        const perfRes = await getAllPerformance();
        if (perfRes.success && perfRes.data) {
          const formattedPerfs = perfRes.data.map((perf, idx) => ({
            id: idx + 1,
            employeeId: perf.employeeId || perf._id,
            empID: perf.employeeId || 'N/A',
            name: perf.employeeName || 'N/A',
            rating: perf.rating || 0,
            feedback: perf.feedback || '',
            strengths: perf.strengths || '',
            areasForImprovement: perf.areasForImprovement || '',
            achievements: perf.achievements || '',
            skills: perf.skills || '',
            reviewDate: perf.reviewDate ? new Date(perf.reviewDate).toLocaleDateString() : new Date().toLocaleDateString(),
            reviewer: perf.reviewedBy || 'HR',
            category: perf.category || 'Overall'
          }));
          setPerformances(formattedPerfs);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenModal = (performance = null) => {
    if (performance) {
      setEditingPerformance(performance);
      setFormData({
        employeeId: performance.employeeId,
        name: performance.name,
        rating: performance.rating,
        feedback: performance.feedback,
        strengths: performance.strengths,
        areasForImprovement: performance.areasForImprovement,
        achievements: performance.achievements,
        skills: performance.skills
      });
    } else {
      setEditingPerformance(null);
      setFormData({
        employeeId: '',
        name: '',
        rating: 3,
        feedback: '',
        strengths: '',
        areasForImprovement: '',
        achievements: '',
        skills: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPerformance(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.rating || !formData.feedback) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const ratingData = {
        rating: formData.rating,
        feedback: formData.feedback,
        strengths: formData.strengths,
        areasForImprovement: formData.areasForImprovement,
        achievements: formData.achievements,
        skills: formData.skills
      };

      const res = await updateEmployeeRating(formData.employeeId, ratingData);
      
      if (res.success) {
        alert('Performance review saved successfully!');
        // Refresh performance data
        const perfRes = await getAllPerformance();
        if (perfRes.success && perfRes.data) {
          const formattedPerfs = perfRes.data.map((perf, idx) => ({
            id: idx + 1,
            employeeId: perf.employeeId || perf._id,
            empID: perf.employeeId || 'N/A',
            name: perf.employeeName || 'N/A',
            rating: perf.rating || 0,
            feedback: perf.feedback || '',
            strengths: perf.strengths || '',
            areasForImprovement: perf.areasForImprovement || '',
            achievements: perf.achievements || '',
            skills: perf.skills || '',
            reviewDate: perf.reviewDate ? new Date(perf.reviewDate).toLocaleDateString() : new Date().toLocaleDateString(),
            reviewer: perf.reviewedBy || 'HR',
            category: perf.category || 'Overall'
          }));
          setPerformances(formattedPerfs);
        }
        handleCloseModal();
      } else {
        alert('Error: ' + (res.message || 'Failed to save performance review'));
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred while saving the performance review');
    }
  };

  const handleDeletePerformance = (perfId) => {
    if (window.confirm('Are you sure you want to delete this performance review?')) {
      setPerformances(prev => prev.filter(perf => perf.id !== perfId));
    }
  };

  const filteredPerformances = performances.filter(perf =>
    perf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    perf.empID.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPerformances = filteredPerformances.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPerformances.length / itemsPerPage);

  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={16}
            style={{
              fill: i <= Math.round(rating) ? '#f59e0b' : '#e5e7eb',
              color: i <= Math.round(rating) ? '#f59e0b' : '#e5e7eb',
              cursor: 'pointer'
            }}
          />
        ))}
        <span style={{ marginLeft: '8px', fontWeight: '600', fontSize: '14px' }}>{rating.toFixed(1)}/5</span>
      </div>
    );
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#10b981';
    if (rating >= 3.5) return '#f59e0b';
    return '#ef4444';
  };

  const averageRating = performances.length > 0 
    ? (performances.reduce((sum, p) => sum + p.rating, 0) / performances.length).toFixed(2)
    : 0;

  // Show loading state
  if (loading) {
    return (
      <div className="page-container">
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading performance data...
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="page-container">
        <div style={{ padding: '40px', textAlign: 'center', color: '#d32f2f' }}>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>Performance Management</h2>
          <p className="subtitle">Track employee performance and reviews</p>
        </div>
        <button className="btn-primary-modern" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Add Performance Review
        </button>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input 
          type="text" 
          placeholder="Search employee..." 
          value={searchTerm}
          onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
        />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h4>Average Rating</h4>
            <p className="stat-number">{averageRating}/5</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Award size={24} />
          </div>
          <div className="stat-content">
            <h4>High Performers</h4>
            <p className="stat-number">{performances.filter(p => p.rating >= 4.5).length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <User size={24} />
          </div>
          <div className="stat-content">
            <h4>Total Reviews</h4>
            <p className="stat-number">{performances.length}</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Category</th>
              <th>Rating</th>
              <th>Feedback</th>
              <th>Reviewer</th>
              <th>Review Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPerformances.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                  No performance reviews found
                </td>
              </tr>
            ) : (
              currentPerformances.map((perf) => (
                <tr key={perf.id}>
                  <td>
                    <div>
                      <strong>{perf.name}</strong>
                      <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>{perf.empID}</p>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      backgroundColor: '#e0e7ff',
                      color: '#4f46e5',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {perf.category}
                    </span>
                  </td>
                  <td>
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: getRatingColor(perf.rating) + '20',
                      display: 'inline-block'
                    }}>
                      {renderStars(perf.rating)}
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', maxWidth: '200px' }}>
                    <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {perf.feedback}
                    </p>
                  </td>
                  <td style={{ fontSize: '13px' }}>{perf.reviewer}</td>
                  <td style={{ fontSize: '13px' }}>{perf.reviewDate}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => handleOpenModal(perf)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon danger" onClick={() => handleDeletePerformance(perf.id)}>
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

      {filteredPerformances.length > itemsPerPage && (
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
        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPerformances.length)} of {filteredPerformances.length} performance reviews
      </div>

      {/* Create/Edit Performance Review Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingPerformance ? 'Edit Performance Review' : 'Add Performance Review'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="employeeId">Select Employee *</label>
                <select
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={(e) => {
                    const emp = employees.find(e => e._id === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      employeeId: e.target.value,
                      name: emp?.name || ''
                    }));
                  }}
                  required
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="rating">Rating (1-5) *</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="range"
                    id="rating"
                    name="rating"
                    min="1"
                    max="5"
                    step="0.5"
                    value={formData.rating}
                    onChange={handleInputChange}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontWeight: '600', minWidth: '50px' }}>
                    {formData.rating.toFixed(1)}/5
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="feedback">Feedback *</label>
                <textarea
                  id="feedback"
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleInputChange}
                  placeholder="Overall feedback on performance"
                  rows="3"
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="strengths">Strengths</label>
                <textarea
                  id="strengths"
                  name="strengths"
                  value={formData.strengths}
                  onChange={handleInputChange}
                  placeholder="List employee strengths"
                  rows="2"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="areasForImprovement">Areas for Improvement</label>
                <textarea
                  id="areasForImprovement"
                  name="areasForImprovement"
                  value={formData.areasForImprovement}
                  onChange={handleInputChange}
                  placeholder="Areas where employee can improve"
                  rows="2"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="achievements">Achievements</label>
                <textarea
                  id="achievements"
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleInputChange}
                  placeholder="Notable achievements"
                  rows="2"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="skills">Skills</label>
                <textarea
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="Relevant skills demonstrated"
                  rows="2"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingPerformance ? 'Update Review' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;
