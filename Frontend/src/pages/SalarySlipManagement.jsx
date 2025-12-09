import { useState, useEffect } from 'react';
import { Send, Download, Mail, CheckCircle, AlertCircle, Plus, X, Eye, FileDown, RefreshCw, Edit } from 'lucide-react';
import { getEmployees, generateAndSendPayslips, setSalary, sendPayslipToDashboard } from '../services/hrService';
import '../styles/SalarySlipManagement.css';

// API functions for payslip operations
// Use relative path to go through Vite proxy
const API_BASE_URL = '/api';

const generatePayslip = async (employeeIds, month, year) => {
  try {
    console.log('🔄 Generating payslip:', { employeeIds, month, year });
    const response = await fetch(`${API_BASE_URL}/payslip/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        employeeIds,
        month: parseInt(month),
        year: parseInt(year)
      })
    });
    if (!response.ok) throw new Error('Failed to generate payslip');
    return await response.json();
  } catch (error) {
    console.error('Error generating payslip:', error);
    throw error;
  }
};

const getAllPayslips = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/payslip`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch payslips');
    return await response.json();
  } catch (error) {
    console.error('Error fetching payslips:', error);
    throw error;
  }
};

const SalarySlipManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Salary Modal States
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryFormData, setSalaryFormData] = useState({
    employeeId: '',
    basicSalary: '',
    allowances: {
      HRA: '',
      DA: '',
      TA: '',
      medical: '',
      other: ''
    },
    deductions: {
      PF: '',
      tax: '',
      insurance: '',
      other: ''
    },
    isActive: true
  });
  const [salaryProcessing, setSalaryProcessing] = useState(false);

  // Salary Slip View States
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [selectedSlipEmployee, setSelectedSlipEmployee] = useState(null);
  const [slipData, setSlipData] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  // Fetch all employees function
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await getEmployees();
      if (response.success && response.data) {
        console.log('📊 Employees fetched with salary data:', response.data);
        setEmployees(response.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setErrorMessage('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle Salary Form Changes
  const handleSalaryFormChange = (e) => {
    const { name, value } = e.target;
    setSalaryFormData({
      ...salaryFormData,
      [name]: value
    });
  };

  const handleAllowanceChange = (field, value) => {
    setSalaryFormData({
      ...salaryFormData,
      allowances: {
        ...salaryFormData.allowances,
        [field]: value
      }
    });
  };

  const handleDeductionChange = (field, value) => {
    setSalaryFormData({
      ...salaryFormData,
      deductions: {
        ...salaryFormData.deductions,
        [field]: value
      }
    });
  };

  // Add Salary Handler
  const handleAddSalary = async (e) => {
    e.preventDefault();
    
    if (!salaryFormData.employeeId) {
      alert('Please select an employee');
      return;
    }

    if (!salaryFormData.basicSalary) {
      alert('Please enter basic salary');
      return;
    }

    const basicSalary = parseFloat(salaryFormData.basicSalary);
    if (basicSalary < 500) {
      alert('❌ Basic salary must be at least ₹500');
      return;
    }

    try {
      setSalaryProcessing(true);
      
      // Get the employee object to get employeeId and userId
      const selectedEmployee = employees.find(emp => emp._id === salaryFormData.employeeId);
      
      if (!selectedEmployee) {
        setErrorMessage('Selected employee not found');
        setSalaryProcessing(false);
        return;
      }

      console.log('👤 Selected Employee:', selectedEmployee);
      
      const salaryData = {
        userId: selectedEmployee.userId || selectedEmployee._id,
        employeeId: selectedEmployee.employeeId,
        basicSalary: parseFloat(salaryFormData.basicSalary),
        allowances: {
          HRA: parseFloat(salaryFormData.allowances.HRA) || 0,
          DA: parseFloat(salaryFormData.allowances.DA) || 0,
          TA: parseFloat(salaryFormData.allowances.TA) || 0,
          medical: parseFloat(salaryFormData.allowances.medical) || 0,
          other: parseFloat(salaryFormData.allowances.other) || 0
        },
        deductions: {
          PF: parseFloat(salaryFormData.deductions.PF) || 0,
          tax: parseFloat(salaryFormData.deductions.tax) || 0,
          insurance: parseFloat(salaryFormData.deductions.insurance) || 0,
          other: parseFloat(salaryFormData.deductions.other) || 0
        },
        isActive: salaryFormData.isActive
      };

      console.log('💾 Salary Data to Send:', salaryData);

      const result = await setSalary(salaryData);
      
      if (result.success) {
        setSuccessMessage(editingEmployeeId ? '✅ Salary record updated successfully!' : '✅ Salary record added successfully!');
        setShowSalaryModal(false);
        setEditingEmployeeId(null);
        // Refresh employee list to show updated salary status
        await fetchEmployees();
        // Reset form
        setSalaryFormData({
          employeeId: '',
          basicSalary: '',
          allowances: {
            HRA: '',
            DA: '',
            TA: '',
            medical: '',
            other: ''
          },
          deductions: {
            PF: '',
            tax: '',
            insurance: '',
            other: ''
          },
          isActive: true
        });
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setErrorMessage(result.message || 'Failed to add salary');
      }
    } catch (error) {
      console.error('Error adding salary:', error);
      setErrorMessage(error.message || 'Error adding salary');
    } finally {
      setSalaryProcessing(false);
    }
  };

  const handleSelectEmployee = (employeeId) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEmployees.size === employees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(employees.map(emp => emp._id || emp.id)));
    }
  };

  // View Salary Slip
  const handleViewSlip = async (employee) => {
    try {
      setSelectedSlipEmployee(employee);
      const [year, month] = selectedMonth.split('-');
      
      console.log('🔍 Fetching payslip data for:', { employeeId: employee._id, month, year });
      
      // Fetch all payslips and find the matching one
      const payslipsResponse = await getAllPayslips();
      const payslips = payslipsResponse.data || [];
      const targetPayslip = payslips.find(p => 
        p.userId === employee.userId && 
        p.month === parseInt(month) && 
        p.year === parseInt(year)
      );

      if (targetPayslip) {
        console.log('✅ Found payslip:', targetPayslip);
        setSlipData(targetPayslip);
      } else {
        // If payslip doesn't exist yet, use mock data
        console.warn('⚠️ Payslip not found, using mock data');
        const slipPayload = {
          employeeId: employee.employeeId,
          employeeName: employee.name,
          month: parseInt(month),
          year: parseInt(year),
          basicSalary: employee.salary || 0,
          allowances: { HRA: 0, DA: 0, TA: 0, medical: 0, other: 0 },
          deductions: { PF: 0, tax: 0, insurance: 0, other: 0 },
          grossSalary: employee.salary || 0,
          netSalary: employee.salary || 0,
          workingDays: 0,
          presentDays: 0,
          halfDays: 0,
          leaveDays: 0,
          paidDays: 0,
        };
        setSlipData(slipPayload);
      }
      setShowSlipModal(true);
    } catch (error) {
      console.error('❌ Error fetching payslip:', error);
      setErrorMessage('Failed to fetch payslip details');
    }
  };

  // Edit Salary for Employee
  const handleEditSalary = (employee) => {
    // Fetch employee's existing salary data
    const existingSalary = employee.salaryDetails || {};
    
    // Pre-populate the form with existing data
    setSalaryFormData({
      employeeId: employee._id,
      basicSalary: existingSalary.basicSalary || employee.salary || '',
      allowances: {
        HRA: existingSalary.allowances?.HRA || '',
        DA: existingSalary.allowances?.DA || '',
        TA: existingSalary.allowances?.TA || '',
        medical: existingSalary.allowances?.medical || '',
        other: existingSalary.allowances?.other || ''
      },
      deductions: {
        PF: existingSalary.deductions?.PF || '',
        tax: existingSalary.deductions?.tax || '',
        insurance: existingSalary.deductions?.insurance || '',
        other: existingSalary.deductions?.other || ''
      },
      isActive: existingSalary.isActive !== false
    });
    
    setEditingEmployeeId(employee._id);
    setShowSalaryModal(true);
  };

  // Download Slip PDF
  const handleDownloadSlip = async (employee) => {
    try {
      setDownloadingId(employee._id);
      setErrorMessage('');
      setSuccessMessage('');
      
      if (!employee.userId) {
        setErrorMessage('Employee user ID not found');
        setDownloadingId(null);
        return;
      }

      // Get month and year from selected month
      const [year, month] = selectedMonth.split('-');
      
      console.log('📥 Starting payslip download for:', employee.name);
      console.log('🔍 Employee details:', { userId: employee.userId, month, year });

      // Step 1: Generate payslip if it doesn't exist
      try {
        await generatePayslip([employee.userId], month, year);
        console.log('✅ Payslip generated/exists');
      } catch (genError) {
        console.warn('⚠️ Generate payslip warning:', genError.message);
        // Continue anyway, payslip might already exist
      }

      // Step 2: Get all payslips to find the one we need
      const payslipsResponse = await getAllPayslips();
      console.log('📋 All payslips response:', payslipsResponse);

      const payslips = payslipsResponse.data || [];
      const targetPayslip = payslips.find(p => 
        p.userId === employee.userId && 
        p.month === parseInt(month) && 
        p.year === parseInt(year)
      );

      if (!targetPayslip) {
        setErrorMessage('Payslip not found. Please generate it first.');
        setDownloadingId(null);
        return;
      }

      console.log('✅ Found payslip ID:', targetPayslip._id);

      // Step 3: Download the PDF
      const downloadResponse = await fetch(
        `/api/payslip/${targetPayslip._id}/download`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (!downloadResponse.ok) {
        throw new Error(`HTTP ${downloadResponse.status}: ${downloadResponse.statusText}`);
      }

      // Get the blob and trigger download
      const blob = await downloadResponse.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = `salary-slip-${employee.employeeId}-${selectedMonth}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(blobUrl);

      setSuccessMessage(`✅ Salary slip for ${employee.name} downloaded successfully!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      console.log('✅ PDF downloaded successfully');

    } catch (error) {
      console.error('❌ Error downloading payslip:', error);
      setErrorMessage(`Failed to download salary slip: ${error.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  // Send Slip to Employee
  const handleSendSlipToEmployee = async (employee) => {
    try {
      setSendingId(employee._id);
      setErrorMessage('');
      setSuccessMessage('');
      
      if (!employee.userId) {
        setErrorMessage('Employee user ID not found');
        setSendingId(null);
        return;
      }

      // Get month and year from selected month
      const [year, month] = selectedMonth.split('-');
      
      console.log('📤 Sending payslip to employee dashboard:', employee.name);

      // Step 1: Generate payslip if it doesn't exist
      try {
        await generatePayslip([employee.userId], month, year);
        console.log('✅ Payslip generated/exists');
      } catch (genError) {
        console.warn('⚠️ Generate payslip warning:', genError.message);
      }

      // Step 2: Get all payslips to find the one we need
      const payslipsResponse = await getAllPayslips();
      const payslips = payslipsResponse.data || [];
      const targetPayslip = payslips.find(p => 
        p.userId === employee.userId && 
        p.month === parseInt(month) && 
        p.year === parseInt(year)
      );

      if (!targetPayslip) {
        setErrorMessage('Payslip not found. Please generate it first.');
        setSendingId(null);
        return;
      }

      console.log('✅ Found payslip ID:', targetPayslip._id);

      // Step 3: Send payslip to employee's dashboard
      const sendResult = await sendPayslipToDashboard(targetPayslip._id);

      if (sendResult.success) {
        setSuccessMessage(`✅ Salary slip for ${employee.name} sent to dashboard successfully! The employee will see it in their notifications.`);
        setTimeout(() => setSuccessMessage(''), 5000);
        console.log('✅ Payslip sent to dashboard');
      }

    } catch (error) {
      console.error('❌ Error sending payslip to dashboard:', error);
      setErrorMessage(`Failed to send salary slip: ${error.message}`);
    } finally {
      setSendingId(null);
    }
  };

  // Send salary slips to selected employees (generate + email in one)
  const handleSendToSelected = async () => {
    if (selectedEmployees.size === 0) {
      setErrorMessage('Please select at least one employee');
      return;
    }

    try {
      setErrorMessage('');
      setSuccessMessage('');

      const [year, month] = selectedMonth.split('-');
      const employeeIds = Array.from(selectedEmployees);

      // Call backend to generate and send
      const result = await generateAndSendPayslips(
        employeeIds, 
        month, 
        year,
        'Your monthly salary slip is attached.'
      );

      if (result.success) {
        setSuccessMessage(`✅ Successfully sent salary slips to ${result.data?.length || 0} employees via email`);
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setErrorMessage(result.message || 'Failed to send salary slips');
      }
    } catch (error) {
      console.error('Error sending salary slips:', error);
      setErrorMessage(error.message || 'Error sending salary slips');
    }
  };

  return (
    <div className="salary-slip-management">
      <div className="management-header">
        <div className="header-title">
          <h1>📊 Send Salary Slips</h1>
          <p>Select employees and send their salary slips via email</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-refresh"
            onClick={fetchEmployees}
            title="Refresh employee data"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            className="btn-add-salary"
            onClick={() => setShowSalaryModal(true)}
            title="Add salary for an employee"
          >
            <Plus size={18} />
            Add Salary
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="message success-message">
          <CheckCircle size={20} />
          <p>{successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="message error-message">
          <AlertCircle size={20} />
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="management-content">
        {/* Employee Selection */}
        <div className="employees-section">
          <div className="employees-header">
            <h3>Select Employees</h3>
            <button
              className="btn-select-all"
              onClick={handleSelectAll}
            >
              {selectedEmployees.size === employees.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="selection-count">
              {selectedEmployees.size} / {employees.length} selected
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              Loading employees...
            </div>
          ) : (
            <div className="employees-grid">
              {employees.map((employee) => (
                <div
                  key={employee._id || employee.id}
                  className={`employee-card ${selectedEmployees.has(employee._id || employee.id) ? 'selected' : ''}`}
                >
                  <div className="employee-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.has(employee._id || employee.id)}
                      onChange={() => handleSelectEmployee(employee._id || employee.id)}
                    />
                  </div>
                  <div className="employee-info">
                    <h4>{employee.name}</h4>
                    <p className="employee-id">ID: {employee.employeeId || 'N/A'}</p>
                    <p className="employee-dept">{employee.department || 'N/A'}</p>
                    <p className="employee-role">{employee.position || 'N/A'}</p>
                    <p className="employee-email">{employee.email || 'No email'}</p>
                    <p className="employee-salary" style={{marginTop: '8px', color: '#10b981', fontWeight: '600'}}>
                      💰 Salary: ₹{employee.salary ? employee.salary.toLocaleString('en-IN') : 'Not Set'}
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  {employee.salary && (
                    <div className="card-actions">
                      <button
                        className="btn-action btn-view"
                        onClick={() => handleViewSlip(employee)}
                        title="View salary slip details"
                      >
                        <Eye size={16} />
                        <span className="btn-label">View</span>
                      </button>
                      <button
                        className="btn-action btn-download"
                        onClick={() => handleDownloadSlip(employee)}
                        disabled={downloadingId === employee._id}
                        title="Download salary slip as PDF"
                      >
                        <FileDown size={16} />
                        <span className="btn-label">
                          {downloadingId === employee._id ? 'Downloading...' : 'Download'}
                        </span>
                      </button>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEditSalary(employee)}
                        title="Edit salary for this employee"
                      >
                        <Edit size={16} />
                        <span className="btn-label">Edit</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {employees.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <p>No employees found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Salary Modal */}
      {showSalaryModal && (
        <div className="modal-overlay" onClick={() => setShowSalaryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEmployeeId ? '✏️ Edit Salary Record' : '💰 Add Salary Record'}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowSalaryModal(false);
                  setEditingEmployeeId(null);
                  setSalaryFormData({
                    employeeId: '',
                    basicSalary: '',
                    allowances: {
                      HRA: '',
                      DA: '',
                      TA: '',
                      medical: '',
                      other: ''
                    },
                    deductions: {
                      PF: '',
                      tax: '',
                      insurance: '',
                      other: ''
                    },
                    isActive: true
                  });
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddSalary} className="salary-form">
              {/* Employee Selection */}
              <div className="form-group">
                <label>Select Employee *</label>
                <select
                  name="employeeId"
                  value={salaryFormData.employeeId}
                  onChange={handleSalaryFormChange}
                  required
                  disabled={editingEmployeeId ? true : false}
                  className="form-input"
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.employeeId || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Basic Salary */}
              <div className="form-group">
                <label>Basic Salary * (₹) <span style={{color: '#ef4444', fontSize: '12px'}}>Min: ₹500</span></label>
                <input
                  type="number"
                  name="basicSalary"
                  value={salaryFormData.basicSalary}
                  onChange={handleSalaryFormChange}
                  placeholder="50000"
                  min="500"
                  required
                  className="form-input"
                />
              </div>

              {/* Allowances Section */}
              <div className="form-section">
                <h3>📈 Allowances</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>HRA (₹)</label>
                    <input
                      type="number"
                      value={salaryFormData.allowances.HRA}
                      onChange={(e) => handleAllowanceChange('HRA', e.target.value)}
                      placeholder="5000"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>DA (₹)</label>
                    <input
                      type="number"
                      value={salaryFormData.allowances.DA}
                      onChange={(e) => handleAllowanceChange('DA', e.target.value)}
                      placeholder="3000"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>TA (₹)</label>
                    <input
                      type="number"
                      value={salaryFormData.allowances.TA}
                      onChange={(e) => handleAllowanceChange('TA', e.target.value)}
                      placeholder="2000"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Medical (₹)</label>
                    <input
                      type="number"
                      value={salaryFormData.allowances.medical}
                      onChange={(e) => handleAllowanceChange('medical', e.target.value)}
                      placeholder="1000"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Other Allowances (₹)</label>
                  <input
                    type="number"
                    value={salaryFormData.allowances.other}
                    onChange={(e) => handleAllowanceChange('other', e.target.value)}
                    placeholder="0"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Deductions Section */}
              <div className="form-section">
                <h3>📉 Deductions</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>PF (₹)</label>
                    <input
                      type="number"
                      value={salaryFormData.deductions.PF}
                      onChange={(e) => handleDeductionChange('PF', e.target.value)}
                      placeholder="5000"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tax (₹)</label>
                    <input
                      type="number"
                      value={salaryFormData.deductions.tax}
                      onChange={(e) => handleDeductionChange('tax', e.target.value)}
                      placeholder="3000"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Insurance (₹)</label>
                    <input
                      type="number"
                      value={salaryFormData.deductions.insurance}
                      onChange={(e) => handleDeductionChange('insurance', e.target.value)}
                      placeholder="500"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Other Deductions (₹)</label>
                    <input
                      type="number"
                      value={salaryFormData.deductions.other}
                      onChange={(e) => handleDeductionChange('other', e.target.value)}
                      placeholder="0"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={salaryFormData.isActive}
                    onChange={(e) =>
                      setSalaryFormData({
                        ...salaryFormData,
                        isActive: e.target.checked
                      })
                    }
                  />
                  Mark as Active ✓
                </label>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowSalaryModal(false);
                    setEditingEmployeeId(null);
                    setSalaryFormData({
                      employeeId: '',
                      basicSalary: '',
                      allowances: {
                        HRA: '',
                        DA: '',
                        TA: '',
                        medical: '',
                        other: ''
                      },
                      deductions: {
                        PF: '',
                        tax: '',
                        insurance: '',
                        other: ''
                      },
                      isActive: true
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={salaryProcessing}
                >
                  {salaryProcessing ? 'Saving...' : (editingEmployeeId ? 'Update Salary' : 'Save Salary')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Slip View Modal */}
      {showSlipModal && selectedSlipEmployee && slipData && (
        <div className="modal-overlay" onClick={() => setShowSlipModal(false)}>
          <div className="modal-content slip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Salary Slip</h2>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowSlipModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="slip-container">
              {/* Header Section */}
              <div className="slip-header">
                <h3>{slipData.employeeName}</h3>
                <p><strong>Employee ID:</strong> {slipData.employeeId}</p>
                <p><strong>Month:</strong> {new Date(slipData.year, slipData.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
              </div>

              {/* Attendance Details Section */}
              <div className="slip-section attendance-section">
                <h4>📅 Attendance Details</h4>
                <div className="attendance-grid">
                  <div className="attendance-card">
                    <span className="label">Working Days</span>
                    <span className="value">{slipData.workingDays || 0}</span>
                  </div>
                  <div className="attendance-card">
                    <span className="label">Present Days</span>
                    <span className="value present">{slipData.presentDays || 0}</span>
                  </div>
                  <div className="attendance-card">
                    <span className="label">Half Days</span>
                    <span className="value half">{slipData.halfDays || 0}</span>
                  </div>
                  <div className="attendance-card">
                    <span className="label">Leave Days</span>
                    <span className="value leave">{slipData.leaveDays || 0}</span>
                  </div>
                  <div className="attendance-card">
                    <span className="label">Paid Days</span>
                    <span className="value paid">{slipData.paidDays || 0}</span>
                  </div>
                </div>
              </div>

              {/* Earnings Section */}
              <div className="slip-section">
                <h4>💰 Earnings</h4>
                <div className="slip-row">
                  <span>Basic Salary</span>
                  <span>₹{(slipData.basicSalary || 0).toLocaleString()}</span>
                </div>
                {slipData.allowances?.HRA > 0 && (
                  <div className="slip-row">
                    <span>HRA</span>
                    <span>₹{slipData.allowances.HRA.toLocaleString()}</span>
                  </div>
                )}
                {slipData.allowances?.DA > 0 && (
                  <div className="slip-row">
                    <span>DA</span>
                    <span>₹{slipData.allowances.DA.toLocaleString()}</span>
                  </div>
                )}
                {slipData.allowances?.TA > 0 && (
                  <div className="slip-row">
                    <span>TA</span>
                    <span>₹{slipData.allowances.TA.toLocaleString()}</span>
                  </div>
                )}
                {slipData.allowances?.medical > 0 && (
                  <div className="slip-row">
                    <span>Medical Allowance</span>
                    <span>₹{slipData.allowances.medical.toLocaleString()}</span>
                  </div>
                )}
                {slipData.allowances?.other > 0 && (
                  <div className="slip-row">
                    <span>Other Allowances</span>
                    <span>₹{slipData.allowances.other.toLocaleString()}</span>
                  </div>
                )}
                <div className="slip-row slip-total">
                  <span>Gross Salary</span>
                  <span>₹{(slipData.grossSalary || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Deductions Section */}
              <div className="slip-section">
                <h4>📉 Deductions</h4>
                {slipData.deductions?.PF > 0 && (
                  <div className="slip-row">
                    <span>PF</span>
                    <span>₹{slipData.deductions.PF.toLocaleString()}</span>
                  </div>
                )}
                {slipData.deductions?.tax > 0 && (
                  <div className="slip-row">
                    <span>Tax</span>
                    <span>₹{slipData.deductions.tax.toLocaleString()}</span>
                  </div>
                )}
                {slipData.deductions?.insurance > 0 && (
                  <div className="slip-row">
                    <span>Insurance</span>
                    <span>₹{slipData.deductions.insurance.toLocaleString()}</span>
                  </div>
                )}
                {slipData.deductions?.other > 0 && (
                  <div className="slip-row">
                    <span>Other Deductions</span>
                    <span>₹{slipData.deductions.other.toLocaleString()}</span>
                  </div>
                )}
                <div className="slip-row slip-total">
                  <span>Total Deductions</span>
                  <span>₹{(Object.values(slipData.deductions || {}).reduce((a, b) => (a || 0) + (b || 0), 0)).toLocaleString()}</span>
                </div>
              </div>

              {/* Summary Section */}
              <div className="slip-section slip-summary">
                <div className="slip-row slip-net-salary">
                  <span>💵 Net Salary</span>
                  <span>₹{(slipData.netSalary || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="slip-actions">
                <button
                  className="btn-primary"
                  onClick={() => handleDownloadSlip(selectedSlipEmployee)}
                >
                  <FileDown size={16} /> Download PDF
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowSlipModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalarySlipManagement;
