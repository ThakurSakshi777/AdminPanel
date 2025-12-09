import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Phone, Check, Users, ArrowRight } from 'lucide-react';
import { registerUser } from '../services/authService';
import { useAuth } from '../context/useAuth';

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'hr' or 'employee'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone) {
      newErrors.phone = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Mobile number must be 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      // Call register API with role
      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: userRole // Include role in signup
      });

      // Use AuthContext to login user after successful registration
      if (response.token && response.user) {
        login(response.user, userRole, response.token);

        // Track HR signup if user is HR
        if (userRole === 'hr') {
          const userId = response.user?._id || response.user?.id || response.user?.userId;
          const userName = response.user?.name || formData.name;
          const userEmail = response.user?.email || formData.email;
          
          // Call HR activity tracking (non-blocking)
          try {
            const trackResponse = await fetch('/api/hr-activity/track-signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                email: userEmail,
                name: userName
              })
            });
            
            if (trackResponse.ok) {
              const trackData = await trackResponse.json();
              console.log('✅ HR Signup tracked:', trackData);
              // Save sessionId for logout tracking
              if (trackData.data?.sessionId) {
                localStorage.setItem('sessionId', trackData.data.sessionId);
              }
            }
          } catch (trackError) {
            console.warn('⚠️ HR activity tracking failed (non-blocking):', trackError);
            // Don't block signup if tracking fails
          }
        }

        // Redirect based on role
        if (userRole === 'employee') {
          navigate('/employee-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        // If no token in response, redirect to login
        navigate('/login');
      }
    } catch (error) {
      setApiError(error.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🏢</div>
          <h1>HRMS</h1>
          <p>Create your account to manage your HR efficiently</p>
        </div>

        {/* Role Selection - Show if no role selected */}
        {!userRole ? (
          <div className="role-selection">
            <h2 className="role-selection-title">Select Your Role</h2>
            <p className="role-selection-subtitle">Choose how you want to access the system</p>
            
            <div className="role-options-grid">
              <button
                type="button"
                className="role-option hr-admin"
                onClick={() => navigate('/hr-signup')}
              >
                <div className="role-option-icon hr-icon">
                  <Users size={40} />
                </div>
                <h3 className="role-option-title">HR Administrator</h3>
                <ul className="role-option-features">
                  <li><Check size={16} /> Manage Employees</li>
                  <li><Check size={16} /> Payroll & Salary</li>
                  <li><Check size={16} /> Leave Management</li>
                  <li><Check size={16} /> Reports & Analytics</li>
                </ul>
                <div className="role-option-cta">
                  Choose Role <ArrowRight size={18} />
                </div>
              </button>

              <button
                type="button"
                className="role-option employee"
                onClick={() => setUserRole('employee')}
              >
                <div className="role-option-icon employee-icon">
                  <User size={40} />
                </div>
                <h3 className="role-option-title">Employee</h3>
                <ul className="role-option-features">
                  <li><Check size={16} /> View Salary Slips</li>
                  <li><Check size={16} /> Leave Requests</li>
                  <li><Check size={16} /> Attendance Records</li>
                  <li><Check size={16} /> Personal Info</li>
                </ul>
                <div className="role-option-cta">
                  Choose Role <ArrowRight size={18} />
                </div>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Registration Form - Show after role selection */}
            <div className="role-display-header">
              <div className="role-display">
                <div className={`role-display-badge ${userRole}-badge`}>
                  {userRole === 'hr' ? <Users size={18} /> : <User size={18} />}
                </div>
                <div className="role-display-info">
                  <p className="role-display-label">Signing up as</p>
                  <p className="role-display-name">{userRole === 'hr' ? 'HR Administrator' : 'Employee'}</p>
                </div>
              </div>
              <button 
                type="button" 
                className="role-change-btn"
                onClick={() => {
                  setUserRole(null);
                  setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
                  setErrors({});
                }}
              >
                Change
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
          {apiError && (
            <div className="auth-error-banner">
              {apiError}
            </div>
          )}
          
          <div className="auth-form-group">
            <label htmlFor="name">Full Name</label>
            <div className="auth-input-wrapper">
              <User size={18} className="auth-input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={errors.name ? 'error' : ''}
              />
            </div>
            {errors.name && <span className="auth-error">{errors.name}</span>}
          </div>

          <div className="auth-form-group">
            <label htmlFor="email">Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={errors.email ? 'error' : ''}
              />
            </div>
            {errors.email && <span className="auth-error">{errors.email}</span>}
          </div>

          <div className="auth-form-group">
            <label htmlFor="phone">Mobile Number</label>
            <div className="auth-input-wrapper">
              <Phone size={18} className="auth-input-icon" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your mobile number"
                className={errors.phone ? 'error' : ''}
                maxLength="10"
              />
            </div>
            {errors.phone && <span className="auth-error">{errors.phone}</span>}
          </div>

          <div className="auth-form-group">
            <label htmlFor="password">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password"
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="auth-error">{errors.password}</span>}
          </div>

          <div className="auth-form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'error' : ''}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="auth-error">{errors.confirmPassword}</span>}
          </div>

          <div className="auth-terms">
            <label className="auth-checkbox">
              <input type="checkbox" required />
              <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
            </label>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="auth-spinner"></span>
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Sign Up
              </>
            )}
          </button>
        </form>

            <div className="auth-footer">
              <p>Already have an account? <Link to="/login" className="auth-link">Login</Link></p>
            </div>
          </>
        )}
      </div>

      <div className="auth-illustration">
        <div className="auth-illustration-content">
          <h2>Welcome to HRMS</h2>
          <p>Join thousands managing their HR operations seamlessly.</p>
          <div className="auth-features">
            <div className="auth-feature-item"><Check size={16} /> Employee Management</div>
            <div className="auth-feature-item"><Check size={16} /> Payroll & Salary</div>
            <div className="auth-feature-item"><Check size={16} /> Leave Management</div>
            <div className="auth-feature-item"><Check size={16} /> 24/7 Support</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
