import { useState, useEffect } from 'react';
import { Camera, Edit } from 'lucide-react';
import { getEmployees, getEmployeeProfile, updateEmployeeProfile } from '../services/hrService';
import EmployeeDetailsForm from '../components/EmployeeDetailsForm';
import DocumentManager from '../components/DocumentManager';
import './EmployeeProfile.css';

function EmployeeProfile() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Fetch all employees on component mount
  useEffect(() => {
    const loadEmployees = async () => {
      await fetchEmployeesList();
    };
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEmployeesList = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getEmployees();
      
      if (response.success && response.data) {
        setEmployees(response.data);
        if (response.data.length > 0) {
          // Load first employee's full profile
          await loadEmployeeProfile(response.data[0]._id || response.data[0].id);
        }
      } else {
        setError('Failed to load employees');
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Error loading employees');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeProfile = async (employeeId) => {
    try {
      const response = await getEmployeeProfile(employeeId);
      
      console.log('=== EMPLOYEE PROFILE API RESPONSE ===');
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Employee ID from response:', response.data?.employeeId);
      console.log('Employee _id from response:', response.data?._id);
      
      if (response.success && response.data) {
        const employee = response.data;
        console.log('Setting selected employee:', employee);
        setSelectedEmployee(employee);
        setIsEditing(false);
      } else {
        setError('Failed to load employee profile');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Error loading profile');
    }
  };

  const handleSelectEmployee = async (employee) => {
    await loadEmployeeProfile(employee._id || employee.id);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async (formData) => {
    try {
      setSaveLoading(true);
      const employeeId = selectedEmployee._id || selectedEmployee.id;

      const response = await updateEmployeeProfile(employeeId, formData);

      if (response.success) {
        // After saving, reload the fresh profile data from the server
        console.log('✅ Profile updated, reloading fresh data...');
        await loadEmployeeProfile(employeeId);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error saving changes:', err);
      setError('Error saving changes: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const renderDetailCard = (label, value) => {
    return (
      <div className="detail-card">
        <span className="detail-label">{label}</span>
        <span className="detail-value">{value || 'N/A'}</span>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>Employee Profile Management</h2>
          <p className="subtitle">Manage comprehensive employee information & details</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'inherit' }}>
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div className="spinner"></div>
          <p>Loading employees...</p>
        </div>
      ) : selectedEmployee && !isEditing ? (
        <>
          {/* Profile Header Section */}
          <div className="profile-header-section">
            <div className="profile-avatar-area">
              <div className="profile-avatar">
                {selectedEmployee?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <button className="btn-avatar-upload">
                <Camera size={16} />
              </button>
            </div>

            <div className="profile-header-info">
              <h1>{selectedEmployee?.name || 'Employee'}</h1>
              <p className="profile-title">
                {selectedEmployee?.position || 'Position'} • {selectedEmployee?.department || 'Department'}
              </p>
              <p className="profile-emp-id">ID: {selectedEmployee?.employeeId || 'N/A'}</p>
            </div>

            <div className="profile-header-actions">
              <button
                className="btn-primary"
                onClick={handleEditToggle}
              >
                <Edit size={16} />
                Edit Profile
              </button>
              <select
                onChange={(e) => {
                  const selected = employees.find(emp => emp._id === e.target.value || emp.id === e.target.value);
                  if (selected) handleSelectEmployee(selected);
                }}
                value={selectedEmployee._id || selectedEmployee.id}
                className="employee-selector"
              >
                {employees.map((emp) => (
                  <option key={emp._id || emp.id} value={emp._id || emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="section-card">
            <div className="section-title">👤 Personal Information</div>
            <div className="detail-grid">
              {renderDetailCard('Full Name', selectedEmployee?.name)}
              {renderDetailCard('Email', selectedEmployee?.email)}
              {renderDetailCard('Phone', selectedEmployee?.phone)}
              {renderDetailCard('Date of Birth', formatDate(selectedEmployee?.dateOfBirth))}
              {renderDetailCard('Gender', selectedEmployee?.gender)}
              {renderDetailCard("Father's / Mother's Name", selectedEmployee?.fatherMotherName)}
              {renderDetailCard('Current Address', selectedEmployee?.currentAddress)}
              {renderDetailCard('Permanent Address', selectedEmployee?.permanentAddress)}
            </div>
          </div>

          {/* Job Information Section */}
          <div className="section-card">
            <div className="section-title">💼 Company / Job Information</div>
            <div className="detail-grid">
              {renderDetailCard('Employee ID', selectedEmployee?.employeeId)}
              {renderDetailCard('Designation', selectedEmployee?.position)}
              {renderDetailCard('Department', selectedEmployee?.department)}
              {renderDetailCard('Date of Joining', formatDate(selectedEmployee?.joinDate))}
              {renderDetailCard('Work Location', selectedEmployee?.workLocation)}
              {renderDetailCard('Employment Type', selectedEmployee?.employmentType)}
            </div>
          </div>

          {/* Salary & Bank Information Section */}
          <div className="section-card">
            <div className="section-title">💰 Salary & Bank Information</div>
            <div className="detail-grid">
              {renderDetailCard('Bank Name', selectedEmployee?.bankName)}
              {renderDetailCard('Account Number', selectedEmployee?.bankAccountNumber)}
              {renderDetailCard('IFSC Code', selectedEmployee?.ifscCode)}
              {renderDetailCard('Payment Mode', selectedEmployee?.paymentMode)}
              {renderDetailCard('Basic Salary', selectedEmployee?.basicSalary ? `₹${selectedEmployee.basicSalary.toLocaleString('en-IN')}` : 'N/A')}
              {renderDetailCard('CTC', selectedEmployee?.ctc ? `₹${selectedEmployee.ctc.toLocaleString('en-IN')}` : 'N/A')}
            </div>
          </div>

          {/* Document Manager Section */}
          {console.log('Passing employeeId to DocumentManager:', selectedEmployee?.employeeId || selectedEmployee?._id || selectedEmployee?.id)}
          <div className="section-card" style={{ marginTop: '30px' }}>
            <div className="section-title">📄 Documents</div>
            <DocumentManager
              employeeId={selectedEmployee?.employeeId || selectedEmployee?._id || selectedEmployee?.id}
              employeeName={selectedEmployee?.name}
            />
          </div>
        </>
      ) : selectedEmployee && isEditing ? (
        <EmployeeDetailsForm
          employee={selectedEmployee}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
          saving={saveLoading}
        />
      ) : null}
    </div>
  );
}

export default EmployeeProfile;
