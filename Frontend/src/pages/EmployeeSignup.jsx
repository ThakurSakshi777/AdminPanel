import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Phone, Lock, User, MapPin, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import '../styles/EmployeeSignup.css';

const EmployeeSignup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    state: '',
    city: '',
    street: '',
    pinCode: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Invalid email format');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError('Valid phone number is required');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.password) {
      setError('Password is required');
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
  };

  const validateStep3 = () => {
    if (!formData.state.trim()) {
      setError('State is required');
      return false;
    }
    if (!formData.city.trim()) {
      setError('City is required');
      return false;
    }
    if (!formData.street.trim()) {
      setError('Street address is required');
      return false;
    }
    if (!formData.pinCode.trim()) {
      setError('Pin code is required');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      setError('');
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      setError('');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep3()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use relative path to go through Vite proxy
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          state: formData.state,
          city: formData.city,
          street: formData.street,
          pinCode: formData.pinCode,
          role: 'employee',
          isApproved: false, // New employees start as unapproved
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Employee Signup Error:', {status: response.status, message: data.message});
        throw new Error(data.message || 'Signup failed');
      }

      setSuccess('Signup successful! Your account is pending HR approval. You will receive an email once approved.');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        state: '',
        city: '',
        street: '',
        pinCode: '',
      });

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-signup-container">
      <div className="signup-box">
        {/* Header */}
        <div className="signup-header">
          <h1>🏢 Employee Registration</h1>
          <p>Join our organization</p>
        </div>

        {/* Progress Steps */}
        <div className="signup-steps">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Personal Info</span>
          </div>
          <div className={`step-line ${step > 1 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Security</span>
          </div>
          <div className={`step-line ${step > 2 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Address</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="alert alert-success">
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="form-step">
              <div className="form-group">
                <label>Full Name *</label>
                <div className="input-group">
                  <User size={18} />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <div className="input-group">
                  <Mail size={18} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <div className="input-group">
                  <Phone size={18} />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <div className="form-step">
              <div className="form-group">
                <label>Password *</label>
                <div className="input-group">
                  <Lock size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>
                <div className="input-group">
                  <Lock size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Address */}
          {step === 3 && (
            <div className="form-step">
              <div className="form-group">
                <label>Street Address *</label>
                <div className="input-group">
                  <MapPin size={18} />
                  <input
                    type="text"
                    name="street"
                    placeholder="Enter your street address"
                    value={formData.street}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="Enter state"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Pin Code *</label>
                <input
                  type="text"
                  name="pinCode"
                  placeholder="Enter pin code"
                  value={formData.pinCode}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            {step > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBack}
                disabled={loading}
              >
                ← Back
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
                disabled={loading}
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            )}
          </div>
        </form>

        {/* Login Link */}
        <div className="signup-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSignup;
