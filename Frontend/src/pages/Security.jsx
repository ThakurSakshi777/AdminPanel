import { Lock, Key, Shield, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { changePassword } from '../services/securityService';

const Security = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear message when user starts typing
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmPassword
      });

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Error changing password:', err);
      console.error('Error response:', err.response?.data);
      
      // Get specific error message from backend
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to change password. Please try again.';
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Security Settings</h2>
          <p className="subtitle">Manage your account security and permissions</p>
        </div>
      </div>

      <div className="security-grid">
        <div className="security-card">
          <div className="security-card-header">
            <Lock size={24} />
            <h3>Change Password</h3>
          </div>
          
          {message.text && (
            <div style={{ 
              padding: '10px', 
              marginBottom: '15px', 
              borderRadius: '6px',
              backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
              color: message.type === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              {message.text}
            </div>
          )}

          <form className="security-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <div className="password-input">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  disabled={loading}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        <div className="security-card">
          <div className="security-card-header">
            <Key size={24} />
            <h3>Two-Factor Authentication</h3>
          </div>
          <p className="security-description">
            Add an extra layer of security to your account
          </p>
          <div className="security-status">
            <span className="badge-status inactive">Disabled</span>
          </div>
          <button className="btn-primary">Enable 2FA</button>
        </div>

        <div className="security-card">
          <div className="security-card-header">
            <Shield size={24} />
            <h3>Session Management</h3>
          </div>
          <div className="session-list">
            <div className="session-item">
              <div>
                <p><strong>Current Session</strong></p>
                <p className="session-info">Windows • Chrome • Mumbai, India</p>
                <p className="session-time">Active now</p>
              </div>
              <span className="badge-status active">Active</span>
            </div>
            <div className="session-item">
              <div>
                <p><strong>Mobile Device</strong></p>
                <p className="session-info">Android • Chrome • Delhi, India</p>
                <p className="session-time">2 hours ago</p>
              </div>
              <button className="btn-danger-small">Logout</button>
            </div>
          </div>
        </div>

        <div className="security-card">
          <div className="security-card-header">
            <Shield size={24} />
            <h3>Admin Permissions</h3>
          </div>
          <div className="permissions-list">
            <label className="permission-item">
              <input type="checkbox" defaultChecked />
              <span>Manage Users</span>
            </label>
            <label className="permission-item">
              <input type="checkbox" defaultChecked />
              <span>Manage Properties</span>
            </label>
            <label className="permission-item">
              <input type="checkbox" defaultChecked />
              <span>Approve Listings</span>
            </label>
            <label className="permission-item">
              <input type="checkbox" defaultChecked />
              <span>Handle Complaints</span>
            </label>
            <label className="permission-item">
              <input type="checkbox" />
              <span>Delete Data</span>
            </label>
          </div>
          <button className="btn-primary">Save Permissions</button>
        </div>
      </div>
    </div>
  );
};

export default Security;
