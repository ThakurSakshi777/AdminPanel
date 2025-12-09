import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn, Users, User, ArrowRight, Check } from 'lucide-react';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'hr' or 'employee'
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      // Call login API (don't pass role - let backend determine it)
      const response = await loginUser({
        email: formData.email,
        password: formData.password
      });

      // Get the actual role from the response
      const actualRole = response.role || userRole || 'employee';
      
      // Use AuthContext to store user info with ACTUAL role from backend
      login(response.user || response, actualRole, response.token);

      // Track HR login if user is HR
      if (actualRole === 'hr') {
        const userId = response.user?._id || response.user?.id || response.user?.userId;
        const userName = response.user?.name || response.user?.fullName || '';
        const userEmail = response.user?.email || formData.email;
        
        // Call HR activity tracking (non-blocking)
        try {
          const trackResponse = await fetch('/api/hr-activity/track-login', {
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
            console.log('✅ HR Login tracked:', trackData);
            // Save sessionId for logout tracking
            if (trackData.data?.sessionId) {
              localStorage.setItem('sessionId', trackData.data.sessionId);
            }
          }
        } catch (trackError) {
          console.warn('⚠️ HR activity tracking failed (non-blocking):', trackError);
          // Don't block login if tracking fails
        }
      }

      // Redirect based on ACTUAL role
      if (actualRole === 'employee') {
        navigate('/employee-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setApiError(error.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🏢</div>
          <h1>HRMS</h1>
          <p>Welcome to HR Management System</p>
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
                onClick={() => navigate('/hr-login')}
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
            {/* Login Form - Show after role selection */}
            <div className="role-display-header">
              <div className="role-display">
                <div className={`role-display-badge ${userRole}-badge`}>
                  {userRole === 'hr' ? <Users size={18} /> : <User size={18} />}
                </div>
                <div className="role-display-info">
                  <p className="role-display-label">Logging in as</p>
                  <p className="role-display-name">{userRole === 'hr' ? 'HR Administrator' : 'Employee'}</p>
                </div>
              </div>
              <button 
                type="button" 
                className="role-change-btn"
                onClick={() => {
                  setUserRole(null);
                  setFormData({ email: '', password: '' });
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
                <label htmlFor="password">Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
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

              <div className="auth-options">
                <label className="auth-checkbox">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="auth-forgot-link">Forgot Password?</Link>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isLoading || !userRole}>
                {isLoading ? (
                  <>
                    <span className="auth-spinner"></span>
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Login
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link></p>
            </div>
          </>
        )}
      </div>

      <div className="auth-illustration">
        <div className="auth-illustration-content">
          <h2>HRMS - HR Management System</h2>
          <p>Streamline your HR operations with our comprehensive management system.</p>
          <div className="auth-features">
            <div className="auth-feature-item">✓ Employee Management</div>
            <div className="auth-feature-item">✓ Payroll & Salary Slips</div>
            <div className="auth-feature-item">✓ Leave Management</div>
            <div className="auth-feature-item">✓ Attendance Tracking</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
