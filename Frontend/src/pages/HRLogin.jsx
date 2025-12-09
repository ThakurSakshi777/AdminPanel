import { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import '../styles/HRLogin.css';

const HRLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use relative path to go through Vite proxy
      const response = await fetch('/api/hr-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('HR Login Error:', {status: response.status, message: data.message});
        setError(data.message || 'Login failed');
        return;
      }

      // Update AuthContext and save to localStorage
      if (data.token && data.hr) {
        // Prepare user data object
        const userData = {
          id: data.hr.id,
          fullName: data.hr.name || data.hr.fullName,
          name: data.hr.name,
          email: data.hr.email,
          phone: data.hr.phone,
          department: data.hr.department,
          sessionId: data.sessionId,
        };

        // Call AuthContext login - this updates auth state AND localStorage
        login(userData, 'hr', data.token);

        // Redirect after auth context is updated
        setTimeout(() => {
          navigate('/');
        }, 500);
      }
    } catch (err) {
      console.error('HR Login Error:', err);
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hr-login-container">
      <div className="hr-login-card">
        <div className="hr-login-header">
          <h1>HR Login</h1>
          <p>Access your HR dashboard</p>
        </div>

        {/* Alert */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-btn"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-login"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an HR account?{' '}
            <a href="/hr-signup">Sign up here</a>
          </p>
          <p>
            <a href="/login">← Back to main login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HRLogin;
