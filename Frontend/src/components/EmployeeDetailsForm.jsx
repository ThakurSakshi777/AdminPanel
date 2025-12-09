import { useState } from 'react';
import { Save, X, ChevronDown } from 'lucide-react';
import '../styles/EmployeeProfileForm.css';

function EmployeeDetailsForm({ employee, onSave, onCancel, saving = false }) {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    fatherMotherName: employee?.fatherMotherName || '',
    dateOfBirth: employee?.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
    gender: employee?.gender || '',
    currentAddress: employee?.currentAddress || '',
    permanentAddress: employee?.permanentAddress || '',
    phone: employee?.phone || '',
    employeeId: employee?.employeeId || '',
    position: employee?.position || '',
    department: employee?.department || '',
    joinDate: employee?.joinDate ? employee.joinDate.split('T')[0] : '',
    workLocation: employee?.workLocation || '',
    employmentType: employee?.employmentType || 'Full-time',
    bankName: employee?.bankName || '',
    bankAccountNumber: employee?.bankAccountNumber || '',
    ifscCode: employee?.ifscCode || '',
    paymentMode: employee?.paymentMode || 'Bank Transfer',
    basicSalary: employee?.basicSalary || 0,
    ctc: employee?.ctc || 0,
    panNumber: employee?.panNumber || '',
    aadharNumber: employee?.aadharNumber || '',
    uan: employee?.uan || '',
    esicNumber: employee?.esicNumber || '',
    pfNumber: employee?.pfNumber || '',
  });

  const [expandedSection, setExpandedSection] = useState('personal');
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Employee name is required';
    }
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.employeeId || !formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phone && formData.phone && !/^\d{10}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = 'Phone number should be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const sections = [
    {
      id: 'personal',
      title: '👤 Personal Information',
      fields: [
        { name: 'name', label: 'Employee Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email ID', type: 'email', required: true },
        { name: 'fatherMotherName', label: "Father's / Mother's Name", type: 'text' },
        { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
        {
          name: 'gender',
          label: 'Gender',
          type: 'select',
          options: [
            { value: '', label: 'Select Gender' },
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
            { value: 'Other', label: 'Other' }
          ]
        },
        { name: 'phone', label: 'Phone Number', type: 'tel' },
        { name: 'currentAddress', label: 'Current Address', type: 'textarea' },
        { name: 'permanentAddress', label: 'Permanent Address', type: 'textarea' },
      ]
    },
    {
      id: 'job',
      title: '💼 Company / Job Information',
      fields: [
        { name: 'employeeId', label: 'Employee ID', type: 'text', required: true, disabled: true },
        { name: 'position', label: 'Designation (Job Title)', type: 'text' },
        { name: 'department', label: 'Department', type: 'text' },
        { name: 'joinDate', label: 'Date of Joining', type: 'date' },
        { name: 'workLocation', label: 'Work Location', type: 'text' },
        {
          name: 'employmentType',
          label: 'Employment Type',
          type: 'select',
          options: [
            { value: 'Full-time', label: 'Full-time' },
            { value: 'Intern', label: 'Intern' },
            { value: 'Contractual', label: 'Contractual' },
            { value: 'Part-Time', label: 'Part-Time' }
          ]
        },
      ]
    },
    {
      id: 'salary',
      title: '💰 Salary & Bank Information',
      fields: [
        { name: 'bankName', label: 'Bank Name', type: 'text' },
        { name: 'bankAccountNumber', label: 'Account Number', type: 'text' },
        { name: 'ifscCode', label: 'IFSC Code', type: 'text' },
        {
          name: 'paymentMode',
          label: 'Payment Mode',
          type: 'select',
          options: [
            { value: 'Bank Transfer', label: 'Bank Transfer' },
            { value: 'Cheque', label: 'Cheque' },
            { value: 'Cash', label: 'Cash' }
          ]
        },
        { name: 'basicSalary', label: 'Basic Salary', type: 'number' },
        { name: 'ctc', label: 'CTC (Cost to Company)', type: 'number' },
      ]
    },
    {
      id: 'compliance',
      title: '📋 Government / Compliance IDs',
      fields: [
        { name: 'panNumber', label: 'PAN Number', type: 'text' },
        { name: 'aadharNumber', label: 'Aadhar Number', type: 'text' },
        { name: 'uan', label: 'UAN (PF Account Number)', type: 'text' },
        { name: 'esicNumber', label: 'ESIC Number', type: 'text' },
        { name: 'pfNumber', label: 'PF Number', type: 'text' },
      ]
    }
  ];

  return (
    <div className="employee-profile-form-wrapper">
      <form onSubmit={handleSubmit} className="employee-profile-form">
        {sections.map((section) => (
          <div key={section.id} className="form-section">
            <div
              className="section-header"
              onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
            >
              <h3>{section.title}</h3>
              <ChevronDown
                size={20}
                style={{
                  transform: expandedSection === section.id ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              />
            </div>

            {expandedSection === section.id && (
              <div className="section-content">
                <div className="form-grid">
                  {section.fields.map((field) => (
                    <div key={field.name} className="form-group">
                      <label className={`form-label ${field.required ? 'required' : 'optional'}`}>
                        {field.label}
                        {field.required && <span className="asterisk">*</span>}
                      </label>

                      {field.type === 'textarea' ? (
                        <textarea
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          disabled={field.disabled}
                          className={`form-input textarea ${errors[field.name] ? 'error' : ''}`}
                          rows="3"
                        />
                      ) : field.type === 'select' ? (
                        <select
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          disabled={field.disabled}
                          className={`form-input ${errors[field.name] ? 'error' : ''}`}
                        >
                          {field.options.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          disabled={field.disabled}
                          className={`form-input ${errors[field.name] ? 'error' : ''}`}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      )}

                      {errors[field.name] && (
                        <span className="error-message">{errors[field.name]}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="form-actions">
          <button
            type="submit"
            className="btn-submit"
            disabled={saving}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
            disabled={saving}
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmployeeDetailsForm;
