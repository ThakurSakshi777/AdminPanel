import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Users, X, ChevronLeft, ChevronRight, Briefcase, AlertCircle, CheckCircle, Filter, Download, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getApprovedEmployees } from '../services/hrService';

const Employees = () => {
  const { isAuthenticated, userRole } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    idGenerationType: 'auto', // 'auto' or 'custom'
    department: 'IT',
    position: '',
    joinDate: '',
    status: 'Active',
    salary: '',
    role: 'employee',
    team: '',
    teamLeader: '',
    address: '',
    password: 'default123'
  });

  // Fetch employees on component mount and when filters change
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    
    // Debug: Check authentication
    const token = localStorage.getItem('authToken');
    console.log('Auth Debug - Token exists:', !!token);
    console.log('Auth Debug - isAuthenticated:', isAuthenticated);
    console.log('Auth Debug - userRole:', userRole);
    
    try {
      // Use the employees endpoint which is more reliable
      const response = await getEmployees();
      console.log('Employees response:', response);
      
      if (response?.success && Array.isArray(response?.data)) {
        setEmployees(response.data);
      } else if (Array.isArray(response?.data)) {
        setEmployees(response.data);
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array
        setEmployees(response);
      } else {
        // Fallback: show error but don't break the UI
        console.warn('Unexpected response format:', response);
        setError('Employees data could not be loaded properly');
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(`Error loading employees: ${err.message || 'Unknown error'}`);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (employee = null) => {
    setError('');
    setSuccess('');
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        employeeId: employee.employeeId || '',
        idGenerationType: 'auto',
        department: employee.department || 'IT',
        position: employee.position || '',
        joinDate: employee.joinDate || '',
        status: employee.status || 'Active',
        salary: employee.salary || '',
        role: employee.role || 'employee',
        team: employee.team || '',
        teamLeader: employee.teamLeader || '',
        address: employee.address || '',
        password: ''
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        employeeId: '',
        idGenerationType: 'auto',
        department: 'IT',
        position: '',
        joinDate: '',
        status: 'Active',
        salary: '',
        role: 'employee',
        team: '',
        teamLeader: '',
        address: '',
        password: 'default123'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setError('');
    setSuccess('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      employeeId: '',
      idGenerationType: 'auto',
      department: 'IT',
      position: '',
      joinDate: '',
      status: 'Active',
      salary: '',
      role: 'employee',
      team: '',
      teamLeader: '',
      address: '',
      password: 'default123'
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
    setError('');
    setSuccess('');
    
    if (!formData.name || !formData.email) {
      setError('Please fill all required fields (Name, Email)');
      return;
    }

    // Validate custom employee ID if selected
    if (!editingEmployee && formData.idGenerationType === 'custom' && !formData.employeeId) {
      setError('Please enter a custom Employee ID');
      return;
    }

    setLoading(true);
    try {
      // Prepare data to send (remove idGenerationType and handle employeeId)
      const dataToSend = { ...formData };
      delete dataToSend.idGenerationType;
      
      // For auto-generate, don't send employeeId (let backend generate it)
      if (formData.idGenerationType === 'auto') {
        dataToSend.employeeId = '';
      }

      if (editingEmployee) {
        // Update employee
        const response = await updateEmployee(editingEmployee._id, dataToSend);
        if (response.success) {
          setSuccess('Employee updated successfully!');
          fetchEmployees();
          setTimeout(handleCloseModal, 1500);
        } else {
          setError(response.message || 'Failed to update employee');
        }
      } else {
        // Create new employee
        const response = await createEmployee(dataToSend);
        if (response.success) {
          setSuccess('Employee created successfully!');
          fetchEmployees();
          setTimeout(handleCloseModal, 1500);
        } else {
          setError(response.message || 'Failed to create employee');
        }
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (empId) => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      setLoading(true);
      setError('');
      try {
        const response = await deleteEmployee(empId);
        if (response.success) {
          setSuccess('Employee deleted successfully!');
          fetchEmployees();
        } else {
          setError(response.message || 'Failed to delete employee');
        }
      } catch (err) {
        setError('Error: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (empId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setLoading(true);
    setError('');
    try {
      const employee = employees.find(e => e._id === empId);
      if (employee) {
        const response = await updateEmployee(empId, { ...employee, status: newStatus });
        if (response.success) {
          setSuccess(`Employee status changed to ${newStatus}!`);
          fetchEmployees();
        } else {
          setError(response.message || 'Failed to update status');
        }
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.phone?.includes(searchTerm) ||
      emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !filterDepartment || emp.department === filterDepartment;
    const matchesStatus = !filterStatus || emp.status === filterStatus;
    const matchesRole = !filterRole || emp.role === filterRole;
    
    return matchesSearch && matchesDepartment && matchesStatus && matchesRole;
  }).sort((a, b) => {
    switch(sortBy) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '');
      case 'date-new':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'date-old':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'salary-high':
        return (b.salary || 0) - (a.salary || 0);
      case 'salary-low':
        return (a.salary || 0) - (b.salary || 0);
      default:
        return 0;
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

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

  // Check authentication before rendering
  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '20px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <AlertCircle size={32} style={{marginBottom: '10px', color: '#ff6b6b'}} />
          <h3>Authentication Required</h3>
          <p>You must be logged in as HR to access this page.</p>
          <button 
            className="btn-primary-modern" 
            onClick={() => window.location.href = '/login'}
            style={{marginTop: '15px'}}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>Employee Management</h2>
          <p className="subtitle">Manage your company employees and their information</p>
        </div>
        <div style={{display: 'flex', gap: '10px'}}>
          <button className="btn-primary-modern" onClick={() => handleOpenModal()} disabled={loading}>
            <Plus size={18} />
            Add New Employee
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          backgroundColor: '#fee', 
          border: '1px solid #fcc', 
          borderRadius: '8px', 
          padding: '12px 16px', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#c33'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div style={{ 
          backgroundColor: '#efe', 
          border: '1px solid #cfc', 
          borderRadius: '8px', 
          padding: '12px 16px', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#3c3'
        }}>
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      <div className="search-bar">
        <Search size={20} />
        <input 
          type="text" 
          placeholder="Search by name, email, phone, employee ID, or department..." 
          value={searchTerm}
          onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
        />
      </div>

      {/* Enhanced Filters Section */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: showAdvancedFilters ? '#667eea' : '#f0f0f0',
              color: showAdvancedFilters ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            <Filter size={16} />
            {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <div style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>
            Showing {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''}
          </div>
        </div>

        {showAdvancedFilters && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>Department</label>
              <select 
                value={filterDepartment}
                onChange={(e) => {setFilterDepartment(e.target.value); setCurrentPage(1);}}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
              >
                <option value="">All Departments</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>Status</label>
              <select 
                value={filterStatus}
                onChange={(e) => {setFilterStatus(e.target.value); setCurrentPage(1);}}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>Role</label>
              <select 
                value={filterRole}
                onChange={(e) => {setFilterRole(e.target.value); setCurrentPage(1);}}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
              >
                <option value="">All Roles</option>
                <option value="employee">Employee</option>
                <option value="tl">Team Lead</option>
                <option value="hr">HR</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>Sort By</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
              >
                <option value="name">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="date-new">Newest First</option>
                <option value="date-old">Oldest First</option>
                <option value="salary-high">Salary (High to Low)</option>
                <option value="salary-low">Salary (Low to High)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>Items Per Page</label>
              <select 
                value={itemsPerPage}
                onChange={(e) => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
              >
                <option value="5">5 items</option>
                <option value="10">10 items</option>
                <option value="15">15 items</option>
                <option value="20">20 items</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={() => {
                  setFilterDepartment('');
                  setFilterStatus('');
                  setFilterRole('');
                  setSortBy('name');
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#f0f0f0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h4>Total Employees</h4>
            <p className="stat-number">{employees.length}</p>
            <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0 0' }}>{filteredEmployees.length} in view</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e8f5e9', color: '#388e3c' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h4>Active Employees</h4>
            <p className="stat-number">{employees.filter(e => e.status === 'Active').length}</p>
            <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0 0' }}>
              {((employees.filter(e => e.status === 'Active').length / employees.length) * 100).toFixed(0)}% active rate
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fff3e0', color: '#f57c00' }}>
            <Briefcase size={24} />
          </div>
          <div className="stat-content">
            <h4>Departments</h4>
            <p className="stat-number">{new Set(employees.map(e => e.department)).size}</p>
            <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0 0' }}>Across organization</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f3e5f5', color: '#7b1fa2' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h4>Team Leads</h4>
            <p className="stat-number">{employees.filter(e => e.role === 'tl').length}</p>
            <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0 0' }}>Management roles</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        {loading && !employees.length ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>Loading employees...</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Position</th>
                <th>Join Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                    No employees found
                  </td>
                </tr>
              ) : (
                currentEmployees.map((emp) => (
                  <tr key={emp._id} style={{ transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td><strong>{emp.employeeId || '-'}</strong></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {emp.profilePic && (
                          <img src={emp.profilePic} alt={emp.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        )}
                        <div>
                          <strong>{emp.name}</strong>
                          {emp.role && <div style={{ fontSize: '11px', color: '#999' }}>{emp.role === 'tl' ? 'Team Lead' : emp.role === 'hr' ? 'HR' : 'Employee'}</div>}
                        </div>
                      </div>
                    </td>
                    <td><a href={`mailto:${emp.email}`} style={{ color: '#667eea', textDecoration: 'none' }}>{emp.email}</a></td>
                    <td>{emp.phone || '-'}</td>
                    <td><span className="badge-role">{emp.department}</span></td>
                    <td>{emp.position || '-'}</td>
                    <td>
                      <span title={emp.joinDate ? new Date(emp.joinDate).toLocaleString() : '-'}>
                        {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString('en-IN') : '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${emp.status?.toLowerCase()}`} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: emp.status === 'Active' ? '#10b981' : emp.status === 'On Leave' ? '#f59e0b' : '#ef4444'
                        }}></span>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons" style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleOpenModal(emp)}
                          disabled={loading}
                          title="Edit"
                          style={{ padding: '6px 8px' }}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn-icon danger" 
                          onClick={() => {if(window.confirm(`Delete ${emp.name}?`)) handleDeleteEmployee(emp._id);}}
                          disabled={loading}
                          title="Delete"
                          style={{ padding: '6px 8px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          className={`btn-icon ${emp.status === 'Active' ? 'success' : 'warning'}`}
                          onClick={() => handleToggleStatus(emp._id, emp.status)}
                          title={emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                          disabled={loading}
                          style={{ padding: '6px 8px' }}
                        >
                          {emp.status === 'Active' ? '✓' : '○'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {filteredEmployees.length > itemsPerPage && (
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
        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length} employees
      </div>

      {/* Add/Edit Employee Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
              <button className="modal-close" onClick={handleCloseModal} disabled={loading}>
                <X size={20} />
              </button>
            </div>
            
            {error && (
              <div style={{ 
                backgroundColor: '#fee', 
                border: '1px solid #fcc', 
                borderRadius: '6px', 
                padding: '10px 12px', 
                marginBottom: '12px',
                color: '#c33',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ 
                backgroundColor: '#efe', 
                border: '1px solid #cfc', 
                borderRadius: '6px', 
                padding: '10px 12px', 
                marginBottom: '12px',
                color: '#3c3',
                fontSize: '14px'
              }}>
                {success}
              </div>
            )}
            
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
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Employee ID Generation</label>
                {!editingEmployee ? (
                  <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="idGenerationType"
                        value="auto"
                        checked={formData.idGenerationType === 'auto'}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                      <span>Auto-generate ID</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="idGenerationType"
                        value="custom"
                        checked={formData.idGenerationType === 'custom'}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                      <span>Custom ID</span>
                    </label>
                  </div>
                ) : (
                  <div style={{ padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px', color: '#666', fontSize: '14px' }}>
                    Employee ID cannot be changed after creation
                  </div>
                )}
              </div>

              {formData.idGenerationType === 'custom' && !editingEmployee && (
                <div className="form-group">
                  <label htmlFor="employeeId">Enter Custom Employee ID *</label>
                  <input
                    type="text"
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    placeholder="e.g., EMP0001 or any custom format"
                    required={formData.idGenerationType === 'custom'}
                    disabled={loading}
                  />
                  <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                    Enter a unique Employee ID. Must be unique in the system.
                  </small>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="position">Position</label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="e.g., Senior Developer"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="joinDate">Join Date</label>
                  <input
                    type="date"
                    id="joinDate"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="salary">Salary</label>
                  <input
                    type="number"
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    placeholder="Enter salary"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <option value="employee">Employee</option>
                    <option value="tl">Team Lead</option>
                    <option value="hr">HR</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="team">Team</label>
                  <input
                    type="text"
                    id="team"
                    name="team"
                    value={formData.team}
                    onChange={handleInputChange}
                    placeholder="Enter team name"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="teamLeader">Team Leader</label>
                  <input
                    type="text"
                    id="teamLeader"
                    name="teamLeader"
                    value={formData.teamLeader}
                    onChange={handleInputChange}
                    placeholder="Enter team leader name"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter address"
                  disabled={loading}
                />
              </div>

              {!editingEmployee && (
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Default: default123"
                    disabled={loading}
                  />
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Processing...' : editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
