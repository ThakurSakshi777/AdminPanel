import { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/HRSignup.css';

const HRSignup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    fullName: '',
    email: '',
    phone: '',
    alternatePhone: '',

    // Step 2: Security
    password: '',
    confirmPassword: '',

    // Step 3: HR Details
    designation: 'HR Manager',
    department: 'Human Resources',
    hrLevel: 'manager',
    officeLocation: '',
    reportingTo: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.fullName || !formData.email || !formData.phone) {
          setError('Please fill all required fields');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Invalid email format');
          return false;
        }
        if (!/^\d{10}$/.test(formData.phone)) {
          setError('Phone must be 10 digits');
          return false;
        }
        return true;

      case 2:
        if (!formData.password || !formData.confirmPassword) {
          setError('Password fields are required');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        return true;

      case 3:
        if (!formData.designation || !formData.department) {
          setError('Please select designation and department');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use relative path to go through Vite proxy
      const response = await fetch('/api/hr-auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          alternatePhone: formData.alternatePhone,
          password: formData.password,
          designation: formData.designation,
          department: formData.department,
          hrLevel: formData.hrLevel,
          officeLocation: formData.officeLocation,
          reportingTo: formData.reportingTo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('HR Signup Error Response:', {
          status: response.status,
          message: data.message,
          data: data
        });
        setError(data.message || 'Registration failed');
        return;
      }

      setSuccess('✅ Registration successful! You can now login with your credentials.');
      console.log('✅ HR Registration successful:', data);
      setTimeout(() => {
        navigate('/hr-login');
      }, 2000);
    } catch (err) {
      console.error('HR Signup Error:', err);
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hr-signup-container">
      <div className="hr-signup-card">
        <div className="hr-signup-header">
          <h1>HR Registration</h1>
          <p>Create your HR account and manage employees</p>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          {[1, 2, 3].map((step) => (
            <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
              <div className="step-number">{step}</div>
              <div className="step-label">
                {step === 1 && 'Personal Info'}
                {step === 2 && 'Security'}
                {step === 3 && 'HR Details'}
              </div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="form-step">
              <h2>Personal Information</h2>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit phone number"
                  maxLength="10"
                  required
                />
              </div>
              <div className="form-group">
                <label>Alternate Phone</label>
                <input
                  type="tel"
                  name="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={handleInputChange}
                  placeholder="Alternate phone number"
                  maxLength="10"
                />
              </div>
            </div>
          )}

          {/* Step 2: Security */}
          {currentStep === 2 && (
            <div className="form-step">
              <h2>Create Password</h2>
              <div className="form-group">
                <label>Password *</label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="toggle-btn"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="toggle-btn"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: HR Details */}
          {currentStep === 3 && (
            <div className="form-step">
              <h2>HR Details</h2>
              <div className="form-group">
                <label>Designation *</label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  required
                >
                  <option value="HR Manager">HR Manager</option>
                  <option value="HR Executive">HR Executive</option>
                  <option value="Recruitment Specialist">Recruitment Specialist</option>
                  <option value="HR Director">HR Director</option>
                  <option value="HR Coordinator">HR Coordinator</option>
                </select>
              </div>
              <div className="form-group">
                <label>Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Human Resources">Human Resources</option>
                  <option value="Recruitment">Recruitment</option>
                  <option value="Payroll">Payroll</option>
                  <option value="Employee Relations">Employee Relations</option>
                </select>
              </div>
              <div className="form-group">
                <label>HR Level *</label>
                <select
                  name="hrLevel"
                  value={formData.hrLevel}
                  onChange={handleInputChange}
                  required
                >
                  <option value="junior">Junior HR</option>
                  <option value="senior">Senior HR</option>
                  <option value="manager">HR Manager</option>
                  <option value="director">HR Director</option>
                </select>
              </div>
              <div className="form-group">
                <label>Office Location</label>
                <input
                  type="text"
                  name="officeLocation"
                  value={formData.officeLocation}
                  onChange={handleInputChange}
                  placeholder="e.g., Noida, Mumbai, Bangalore"
                />
              </div>
              <div className="form-group">
                <label>Reporting To</label>
                <input
                  type="text"
                  name="reportingTo"
                  value={formData.reportingTo}
                  onChange={handleInputChange}
                  placeholder="Name of your manager/supervisor"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="form-actions">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="btn btn-secondary"
                disabled={loading}
              >
                Previous
              </button>
            )}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary"
                disabled={loading}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register as HR'}
              </button>
            )}
          </div>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account?{' '}
            <a href="/hr-login">Login here</a>
          </p>
          <p style={{ marginTop: '12px', fontSize: '13px' }}>
            <a href="/signup" style={{ color: '#94a3b8' }}>← Back to main signup</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HRSignup;
