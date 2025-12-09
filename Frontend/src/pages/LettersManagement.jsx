import { useState, useEffect } from 'react';
import { FileText, Send, Download, Plus, X, Eye, Calendar, User, Briefcase, Trash2 } from 'lucide-react';
import '../styles/LettersManagement.css';
import * as hrService from '../services/hrService';

const LettersManagement = () => {
  const [letterType, setLetterType] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [letterData, setLetterData] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const letterTypes = [
    { id: 'offer', label: 'Offer Letter', icon: '📄' },
    { id: 'joining', label: 'Joining Letter', icon: '📋' },
    { id: 'confirmation', label: 'Confirmation Letter', icon: '✓' },
    { id: 'promotion', label: 'Promotion Letter', icon: '⬆️' },
    { id: 'increment', label: 'Increment Letter', icon: '📈' },
    { id: 'pip', label: 'PIP Letter', icon: '⚠️' },
    { id: 'warning', label: 'Warning Letter', icon: '⛔' },
    { id: 'experience', label: 'Experience Letter', icon: '🎓' },
    { id: 'internship', label: 'Internship Letter', icon: '👨‍🎓' },
  ];

  const letterFieldConfig = {
    offer: {
      fields: [
        { name: 'position', label: 'Position', type: 'text', required: true },
        { name: 'department', label: 'Department', type: 'text', required: true },
        { name: 'salary', label: 'Annual Salary (₹)', type: 'number', required: true },
        { name: 'joiningDate', label: 'Joining Date', type: 'date', required: true },
        { name: 'ctc', label: 'CTC (₹)', type: 'number', required: true },
        { name: 'reportingManager', label: 'Reporting Manager', type: 'text', required: true },
      ]
    },
    joining: {
      fields: [
        { name: 'position', label: 'Position', type: 'text', required: true },
        { name: 'department', label: 'Department', type: 'text', required: true },
        { name: 'joiningDate', label: 'Joining Date', type: 'date', required: true },
        { name: 'reportingManager', label: 'Reporting Manager', type: 'text', required: true },
      ]
    },
    confirmation: {
      fields: [
        { name: 'position', label: 'Position', type: 'text', required: true },
        { name: 'department', label: 'Department', type: 'text', required: true },
        { name: 'confirmationDate', label: 'Confirmation Date', type: 'date', required: true },
        { name: 'probationPeriod', label: 'Probation Period (months)', type: 'number', required: true },
      ]
    },
    promotion: {
      fields: [
        { name: 'currentPosition', label: 'Current Position', type: 'text', required: true },
        { name: 'newPosition', label: 'New Position', type: 'text', required: true },
        { name: 'department', label: 'Department', type: 'text', required: true },
        { name: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
        { name: 'newSalary', label: 'New Salary (₹)', type: 'number', required: true },
        { name: 'promotionBenefits', label: 'Promotion Benefits', type: 'textarea', required: false },
      ]
    },
    increment: {
      fields: [
        { name: 'position', label: 'Position', type: 'text', required: true },
        { name: 'currentSalary', label: 'Current Salary (₹)', type: 'number', required: true },
        { name: 'newSalary', label: 'New Salary (₹)', type: 'number', required: true },
        { name: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
        { name: 'incrementPercentage', label: 'Increment %', type: 'number', required: false },
      ]
    },
    pip: {
      fields: [
        { name: 'position', label: 'Position', type: 'text', required: true },
        { name: 'pipReason', label: 'PIP Reason', type: 'textarea', required: true },
        { name: 'pipDuration', label: 'PIP Duration (months)', type: 'number', required: true },
        { name: 'startDate', label: 'PIP Start Date', type: 'date', required: true },
        { name: 'expectations', label: 'Performance Expectations', type: 'textarea', required: true },
        { name: 'reportingManager', label: 'Reporting Manager', type: 'text', required: true },
      ]
    },
    warning: {
      fields: [
        { name: 'position', label: 'Position', type: 'text', required: true },
        { name: 'warningReason', label: 'Warning Reason', type: 'textarea', required: true },
        { name: 'issueDate', label: 'Issue Date', type: 'date', required: true },
        { name: 'correctionPeriod', label: 'Correction Period (days)', type: 'number', required: true },
        { name: 'consequences', label: 'Consequences of Non-Compliance', type: 'textarea', required: false },
      ]
    },
    experience: {
      fields: [
        { name: 'position', label: 'Position', type: 'text', required: true },
        { name: 'department', label: 'Department', type: 'text', required: true },
        { name: 'joiningDate', label: 'Joining Date', type: 'date', required: true },
        { name: 'exitDate', label: 'Exit Date', type: 'date', required: true },
        { name: 'performance', label: 'Performance Summary', type: 'textarea', required: false },
        { name: 'responsibility', label: 'Key Responsibilities', type: 'textarea', required: false },
      ]
    },
    internship: {
      fields: [
        { name: 'position', label: 'Internship Position', type: 'text', required: true },
        { name: 'department', label: 'Department', type: 'text', required: true },
        { name: 'duration', label: 'Duration (months)', type: 'number', required: true },
        { name: 'startDate', label: 'Start Date', type: 'date', required: true },
        { name: 'stipend', label: 'Monthly Stipend (₹)', type: 'number', required: false },
        { name: 'mentor', label: 'Assigned Mentor', type: 'text', required: false },
      ]
    }
  };

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
    fetchLetters();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await hrService.getEmployees();
      console.log('API Response:', response);
      
      if (response.success && Array.isArray(response.data)) {
        setEmployees(response.data);
        console.log('✅ Employees loaded:', response.data.length, 'employees');
      } else if (Array.isArray(response)) {
        // If response is directly an array
        setEmployees(response);
        console.log('✅ Employees loaded:', response.length, 'employees');
      } else {
        console.error('Unexpected response format:', response);
        setError('Failed to load employees - invalid format');
      }
    } catch (err) {
      console.error('❌ Error fetching employees:', err);
      setError('Error fetching employees: ' + err.message);
    }
  };

  const fetchLetters = async () => {
    try {
      const data = await hrService.getAllLetters();
      if (data.success || data.letters) {
        setLetters(data.data || data.letters || []);
      }
    } catch (err) {
      console.error('Error fetching letters:', err);
    }
  };

  const handleLetterTypeSelect = (type) => {
    console.log('Letter type selected:', type);
    setLetterType(type);
    setSelectedEmployee(null);
    setLetterData({});
    setError('');
    setSuccess('');
    
    // Scroll form into view
    setTimeout(() => {
      const formSection = document.querySelector('.letter-form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLetterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!selectedEmployee) {
      setError('Please select an employee');
      return false;
    }

    const config = letterFieldConfig[letterType];
    for (let field of config.fields) {
      if (field.required && !letterData[field.name]) {
        setError(`${field.label} is required`);
        return false;
      }
    }
    return true;
  };

  const handleGenerateLetter = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('📝 Generating Letter with data:', {
        employeeId: selectedEmployee._id,
        employeeName: selectedEmployee.name,
        letterType,
        letterData,
      });

      const data = await hrService.generateLetter({
        employeeId: selectedEmployee._id,
        letterType,
        letterData,
        employeeName: selectedEmployee.name,
        employeeEmail: selectedEmployee.email,
      });

      console.log('✅ Generation Response:', data);

      if (data.success) {
        setSuccess('✅ Letter generated successfully! Check employee dashboard to see the letter.');
        console.log('📨 Letter created, refreshing list...');
        fetchLetters();
        setTimeout(() => {
          setLetterType('');
          setSelectedEmployee(null);
          setLetterData({});
          setSuccess('');
        }, 2000);
      } else {
        console.error('❌ Generation failed:', data.message);
        setError(data.message || 'Failed to generate letter');
      }
    } catch (err) {
      console.error('❌ Error generating letter:', err);
      setError('Error generating letter: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLetter = async (letterId) => {
    try {
      const blob = await hrService.downloadLetter(letterId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `letter-${letterId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error downloading letter: ' + err.message);
    }
  };

  const handleDeleteLetter = async (letterId) => {
    if (window.confirm('Are you sure you want to delete this letter?')) {
      try {
        setLoading(true);
        const data = await hrService.deleteLetter(letterId);
        if (data.success) {
          setSuccess('Letter deleted successfully!');
          fetchLetters();
        } else {
          setError(data.message || 'Failed to delete letter');
        }
      } catch (err) {
        setError('Error deleting letter: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="letters-container">
      <div className="letters-header">
        <div>
          <h1>📧 Letters Management</h1>
          <p>BHOOMI TECHZONE Pvt. Ltd. | A-43, Sector-63, Noida (201301) | Contact: (+91) 8130787194</p>
        </div>
      </div>

      <div className="letters-content">
        {/* Left Panel - Letter Creation */}
        <div className="letters-creator">
          <h2>Create Letter</h2>
          
          {error && (
            <div className="alert alert-error">
              <span>❌ {error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span>✅ {success}</span>
            </div>
          )}

          {!letterType ? (
            <div className="letter-types">
              <h3>Select Letter Type</h3>
              <div className="letter-grid">
                {letterTypes.map(type => (
                  <button
                    key={type.id}
                    className="letter-type-btn"
                    onClick={() => handleLetterTypeSelect(type.id)}
                  >
                    <span className="letter-icon">{type.icon}</span>
                    <span className="letter-label">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="letter-form-section">
              <div className="form-header">
                <button 
                  className="btn-back"
                  onClick={() => setLetterType('')}
                >
                  ← Back
                </button>
                <div className="form-header-title">
                  <h3>{letterTypes.find(t => t.id === letterType)?.label}</h3>
                  <span className="form-header-icon">{letterTypes.find(t => t.id === letterType)?.icon}</span>
                </div>
              </div>

              <form onSubmit={handleGenerateLetter} className="letter-form">
                {/* Employee Selection Section */}
                <div className="form-section">
                  <h4 className="section-title">📋 Select Employee</h4>
                  <div className="form-group">
                    <label>Employee *</label>
                    <select 
                      value={selectedEmployee?._id || ''}
                      onChange={(evt) => {
                        const emp = employees.find(e => e._id === evt.target.value);
                        setSelectedEmployee(emp);
                        console.log('Employee selected:', emp);
                      }}
                      required
                      className="select-input employee-select"
                      size={5}
                    >
                      <option value="">-- Choose Employee --</option>
                      {employees && employees.length > 0 ? (
                        employees.map(emp => (
                          <option key={emp._id} value={emp._id}>
                            {emp.name} ({emp.employeeId}) - {emp.position}
                          </option>
                        ))
                      ) : (
                        <option disabled>No employees available</option>
                      )}
                    </select>
                    {employees.length === 0 && (
                      <p className="help-text" style={{color: '#e74c3c', marginTop: '8px', fontSize: '12px'}}>
                        ⚠️ No employees found. Please check the employee list.
                      </p>
                    )}
                  </div>
                </div>

                {/* Employee Details Card */}
                {selectedEmployee && (
                  <div className="form-section">
                    <h4 className="section-title">👤 Employee Details</h4>
                    <div className="employee-info-card">
                      <div className="info-row">
                        <div className="info-col">
                          <span className="info-label">Full Name</span>
                          <span className="info-value">{selectedEmployee.name}</span>
                        </div>
                        <div className="info-col">
                          <span className="info-label">Employee ID</span>
                          <span className="info-value">{selectedEmployee.employeeId}</span>
                        </div>
                      </div>
                      <div className="info-row">
                        <div className="info-col">
                          <span className="info-label">Position</span>
                          <span className="info-value">{selectedEmployee.position}</span>
                        </div>
                        <div className="info-col">
                          <span className="info-label">Department</span>
                          <span className="info-value">{selectedEmployee.department}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Letter Details Section */}
                {selectedEmployee && (
                  <div className="form-section">
                    <h4 className="section-title">📝 Letter Details</h4>
                    <div className="letter-fields-grid">
                      {letterFieldConfig[letterType]?.fields.map(field => (
                        <div key={field.name} className={`form-group ${field.type === 'textarea' ? 'full-width' : ''}`}>
                          <label>
                            {field.label}
                            {field.required && <span className="required">*</span>}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea
                              name={field.name}
                              value={letterData[field.name] || ''}
                              onChange={handleInputChange}
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              rows={4}
                              className="textarea-input"
                            />
                          ) : (
                            <input
                              type={field.type}
                              name={field.name}
                              value={letterData[field.name] || ''}
                              onChange={handleInputChange}
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              className="text-input"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                {selectedEmployee && (
                  <div className="form-section">
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn-preview"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        <Eye size={18} /> Preview
                      </button>
                      <button 
                        type="submit" 
                        className="btn-generate"
                        disabled={loading}
                      >
                        <FileText size={18} /> {loading ? 'Generating...' : 'Generate Letter'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Right Panel - Generated Letters */}
        <div className="letters-history">
          <h2>Generated Letters</h2>
          
          {letters.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <p>No letters generated yet</p>
            </div>
          ) : (
            <div className="letters-list">
              {letters.map(letter => (
                <div key={letter._id} className="letter-card">
                  <div className="letter-card-header">
                    <div className="letter-info">
                      <h4>{letterTypes.find(t => t.id === letter.letterType)?.label}</h4>
                      <p className="employee-name">{letter.employeeName}</p>
                      <span className="letter-id">
                        ID: {typeof letter.employeeId === 'object' ? letter.employeeId?.employeeId : letter.employeeId}
                      </span>
                    </div>
                    <span className={`status ${letter.status}`}>
                      {letter.status === 'sent' ? '📤 Sent' : '📋 Draft'}
                    </span>
                  </div>

                  <div className="letter-meta">
                    <span className="meta-item">
                      <Calendar size={14} /> {new Date(letter.createdAt).toLocaleDateString()}
                    </span>
                    <span className="meta-item">
                      <Briefcase size={14} /> {letter.employeePosition}
                    </span>
                  </div>

                  <div className="letter-actions">
                    <button 
                      className="btn-action btn-download"
                      onClick={() => handleDownloadLetter(letter._id)}
                      title="Download as PDF"
                      disabled={loading}
                    >
                      <Download size={16} /> Download
                    </button>
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteLetter(letter._id)}
                      disabled={loading}
                      title="Delete letter"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LettersManagement;
