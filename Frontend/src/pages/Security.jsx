import { Lock, Key, Shield, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const Security = () => {
  const [showPassword, setShowPassword] = useState(false);

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
          <form className="security-form">
            <div className="form-group">
              <label>Current Password</label>
              <div className="password-input">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter current password" 
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
              <input type="password" placeholder="Enter new password" />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" placeholder="Confirm new password" />
            </div>
            <button type="submit" className="btn-primary">Update Password</button>
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
