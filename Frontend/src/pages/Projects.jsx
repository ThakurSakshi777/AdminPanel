import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Briefcase, X, ChevronLeft, ChevronRight, Calendar, Users, TrendingUp } from 'lucide-react';
import { getProjects, createProject, updateProject, deleteProject, getEmployees } from '../services/hrService';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: 'Medium',
    status: 'Planning',
    progress: 0,
    budget: 0
  });

  // Fetch projects and employees on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch employees
        const empRes = await getEmployees();
        if (empRes.success && empRes.data) {
          setEmployees(empRes.data);
        }
        
        // Fetch projects
        const projRes = await getProjects();
        if (projRes.success && projRes.data) {
          setProjects(projRes.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      const assignedIds = project.teamMembers?.map(tm => tm.userId) || [];
      setSelectedEmployees(assignedIds);
      setFormData({
        projectName: project.projectName,
        description: project.description,
        startDate: project.startDate?.substring(0, 10) || '',
        endDate: project.endDate?.substring(0, 10) || '',
        priority: project.priority,
        status: project.status,
        progress: project.progress,
        budget: project.budget || 0
      });
    } else {
      setEditingProject(null);
      setSelectedEmployees([]);
      setFormData({
        projectName: '',
        description: '',
        startDate: '',
        endDate: '',
        priority: 'Medium',
        status: 'Planning',
        progress: 0,
        budget: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'progress' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.projectName || !formData.startDate) {
      alert('Please fill all required fields');
      return;
    }

    if (selectedEmployees.length === 0) {
      alert('Please assign at least one employee');
      return;
    }

    try {
      const projectData = {
        projectName: formData.projectName,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        priority: formData.priority,
        status: formData.status,
        progress: formData.progress,
        budget: formData.budget,
        teamMembers: selectedEmployees.map(empId => {
          const emp = employees.find(e => e._id === empId);
          return {
            userId: empId,
            employeeId: emp?.employeeId || '',
            name: emp?.name || '',
            role: 'Team Member'
          };
        })
      };

      if (editingProject) {
        const res = await updateProject(editingProject._id, projectData);
        if (res.success) {
          // Refresh projects
          const projRes = await getProjects();
          if (projRes.success && projRes.data) {
            setProjects(projRes.data);
          }
          alert('Project updated successfully!');
        } else {
          alert('Error updating project: ' + res.message);
        }
      } else {
        const res = await createProject(projectData);
        if (res.success) {
          // Refresh projects
          const projRes = await getProjects();
          if (projRes.success && projRes.data) {
            setProjects(projRes.data);
          }
          alert('Project created successfully!');
        } else {
          alert('Error creating project: ' + res.message);
        }
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while saving the project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const res = await deleteProject(projectId);
        if (res.success) {
          // Refresh projects
          const projRes = await getProjects();
          if (projRes.success && projRes.data) {
            setProjects(projRes.data);
          }
          alert('Project deleted successfully!');
        } else {
          alert('Error deleting project: ' + res.message);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while deleting the project');
      }
    }
  };

  const filteredProjects = (projects || []).filter(proj =>
    proj.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proj.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f97316';
      case 'Medium': return '#eab308';
      case 'Low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'Planning': return 'warning';
      case 'On Hold': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>Project Management</h2>
          <p className="subtitle">Track and manage all projects and assignments</p>
        </div>
        <button className="btn-primary-modern" onClick={() => handleOpenModal()} disabled={loading}>
          <Plus size={18} />
          Create New Project
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading projects...
        </div>
      ) : (
        <>
          <div className="search-bar">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            />
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Briefcase size={24} />
              </div>
              <div className="stat-content">
                <h4>Total Projects</h4>
                <p className="stat-number">{projects.length}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <h4>In Progress</h4>
                <p className="stat-number">{projects.filter(p => p.status === 'In Progress').length}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <h4>Assigned Resources</h4>
                <p className="stat-number">{new Set(projects.flatMap(p => p.teamMembers?.map(tm => tm.userId) || [])).size}</p>
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProjects.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                      No projects found
                    </td>
                  </tr>
                ) : (
                  currentProjects.map((proj) => (
                    <tr key={proj._id}>
                      <td>
                        <div>
                          <strong>{proj.projectName}</strong>
                          <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>{proj.description}</p>
                        </div>
                      </td>
                      <td>{new Date(proj.startDate).toLocaleDateString()}</td>
                      <td>{new Date(proj.endDate).toLocaleDateString()}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '4px',
                          backgroundColor: getPriorityColor(proj.priority) + '20',
                          color: getPriorityColor(proj.priority),
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {proj.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-status ${getStatusColor(proj.status)}`}>
                          {proj.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '100px',
                            height: '8px',
                            backgroundColor: '#e0e0e0',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${proj.progress}%`,
                              height: '100%',
                              backgroundColor: '#4f46e5',
                              transition: 'width 0.3s'
                            }} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: '600' }}>{proj.progress}%</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {proj.teamMembers?.map((emp, idx) => (
                            <span key={idx} className="badge-role" style={{ fontSize: '11px' }}>
                              {emp.name || emp.userId}
                            </span>
                          )) || <span style={{ fontSize: '11px', color: '#666' }}>No assignments</span>}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" onClick={() => handleOpenModal(proj)}>
                            <Edit size={16} />
                          </button>
                          <button className="btn-icon danger" onClick={() => handleDeleteProject(proj._id)}>
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

          {filteredProjects.length > itemsPerPage && (
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
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProjects.length)} of {filteredProjects.length} projects
          </div>
        </>
      )}

      {/* Create/Edit Project Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProject ? 'Edit Project' : 'Create New Project'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="projectName">Project Name *</label>
                <input
                  type="text"
                  id="projectName"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter project description"
                  rows="3"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date *</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
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
                    <option value="Critical">Critical</option>
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
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="progress">Progress (%): {formData.progress}%</label>
                  <input
                    type="range"
                    id="progress"
                    name="progress"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={handleInputChange}
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="budget">Budget (₹)</label>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="Enter budget amount"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="assignedTo">Assign Team Members</label>
                <div style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '6px', 
                  padding: '8px', 
                  maxHeight: '200px', 
                  overflowY: 'auto',
                  backgroundColor: '#f9fafb'
                }}>
                  {employees.length === 0 ? (
                    <p style={{ color: '#666', margin: 0 }}>No employees available</p>
                  ) : (
                    employees.map(emp => (
                      <div key={emp._id} style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', margin: 0 }}>
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(emp._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEmployees([...selectedEmployees, emp._id]);
                              } else {
                                setSelectedEmployees(selectedEmployees.filter(id => id !== emp._id));
                              }
                            }}
                            style={{ marginRight: '8px', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '14px' }}>
                            {emp.name} ({emp.employeeId})
                          </span>
                        </label>
                      </div>
                    ))
                  )}
                </div>
                {selectedEmployees.length > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#4f46e5' }}>
                    {selectedEmployees.length} employee(s) selected
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
