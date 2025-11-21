import { useState } from 'react';
import { 
  Bell, Moon, Sun, Globe, Lock, Eye, Shield, 
  Mail, Smartphone, Database, Download, Trash2,
  CheckCircle, AlertCircle
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    // Appearance
    darkMode: localStorage.getItem('darkMode') === 'true',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    
    // Privacy
    profileVisibility: 'public',
    showEmail: true,
    showPhone: false,
    twoFactorAuth: false,
    
    // Data
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: '90days'
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleToggle = (key) => {
    const newValue = !settings[key];
    setSettings(prev => ({
      ...prev,
      [key]: newValue
    }));

    // Handle dark mode toggle
    if (key === 'darkMode') {
      localStorage.setItem('darkMode', newValue);
      document.body.classList.toggle('dark-mode', newValue);
    }
  };

  const handleSelectChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Save settings to localStorage
    Object.keys(settings).forEach(key => {
      localStorage.setItem(`setting_${key}`, settings[key]);
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleExportData = () => {
    alert('Exporting your data... This will download all your information.');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion initiated. You will receive a confirmation email.');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your application preferences and account settings</p>
      </div>

      {showSuccess && (
        <div className="settings-alert success">
          <CheckCircle size={20} />
          Settings saved successfully!
        </div>
      )}

      <div className="settings-content">
        {/* Appearance Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-icon">
              {settings.darkMode ? <Moon size={24} /> : <Sun size={24} />}
            </div>
            <div>
              <h2>Appearance</h2>
              <p>Customize how RentifyPro looks on your device</p>
            </div>
          </div>

          <div className="settings-items">
            <div className="settings-item">
              <div className="settings-item-info">
                <h4>Dark Mode</h4>
                <p>Enable dark theme across the application</p>
              </div>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={() => handleToggle('darkMode')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <h4>Language</h4>
                <p>Select your preferred language</p>
              </div>
              <select
                value={settings.language}
                onChange={(e) => handleSelectChange('language', e.target.value)}
                className="settings-select"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="mr">मराठी</option>
              </select>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <h4>Date Format</h4>
                <p>Choose how dates are displayed</p>
              </div>
              <select
                value={settings.dateFormat}
                onChange={(e) => handleSelectChange('dateFormat', e.target.value)}
                className="settings-select"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <h4>Time Format</h4>
                <p>Select 12-hour or 24-hour format</p>
              </div>
              <select
                value={settings.timeFormat}
                onChange={(e) => handleSelectChange('timeFormat', e.target.value)}
                className="settings-select"
              >
                <option value="12h">12-hour</option>
                <option value="24h">24-hour</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-icon">
              <Bell size={24} />
            </div>
            <div>
              <h2>Notifications</h2>
              <p>Manage how you receive updates and alerts</p>
            </div>
          </div>

          <div className="settings-items">
            <div className="settings-item">
              <div className="settings-item-info">
                <Mail size={18} />
                <div>
                  <h4>Email Notifications</h4>
                  <p>Receive updates via email</p>
                </div>
              </div>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <Bell size={18} />
                <div>
                  <h4>Push Notifications</h4>
                  <p>Get instant notifications in browser</p>
                </div>
              </div>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <Smartphone size={18} />
                <div>
                  <h4>SMS Notifications</h4>
                  <p>Receive important alerts via SMS</p>
                </div>
              </div>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={() => handleToggle('smsNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <Mail size={18} />
                <div>
                  <h4>Weekly Reports</h4>
                  <p>Get weekly summary of activities</p>
                </div>
              </div>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.weeklyReports}
                  onChange={() => handleToggle('weeklyReports')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy & Security Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-icon">
              <Shield size={24} />
            </div>
            <div>
              <h2>Privacy & Security</h2>
              <p>Control your privacy and security preferences</p>
            </div>
          </div>

          <div className="settings-items">
            <div className="settings-item">
              <div className="settings-item-info">
                <h4>Profile Visibility</h4>
                <p>Who can see your profile</p>
              </div>
              <select
                value={settings.profileVisibility}
                onChange={(e) => handleSelectChange('profileVisibility', e.target.value)}
                className="settings-select"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="team">Team Only</option>
              </select>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <Eye size={18} />
                <div>
                  <h4>Show Email</h4>
                  <p>Display email on your profile</p>
                </div>
              </div>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.showEmail}
                  onChange={() => handleToggle('showEmail')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <Eye size={18} />
                <div>
                  <h4>Show Phone</h4>
                  <p>Display phone number on your profile</p>
                </div>
              </div>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.showPhone}
                  onChange={() => handleToggle('showPhone')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <Lock size={18} />
                <div>
                  <h4>Two-Factor Authentication</h4>
                  <p>Add an extra layer of security</p>
                </div>
              </div>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle('twoFactorAuth')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-icon">
              <Database size={24} />
            </div>
            <div>
              <h2>Data Management</h2>
              <p>Manage your data and backups</p>
            </div>
          </div>

          <div className="settings-items">
            <div className="settings-item">
              <div className="settings-item-info">
                <Database size={18} />
                <div>
                  <h4>Auto Backup</h4>
                  <p>Automatically backup your data</p>
                </div>
              </div>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={() => handleToggle('autoBackup')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <h4>Backup Frequency</h4>
                <p>How often to backup data</p>
              </div>
              <select
                value={settings.backupFrequency}
                onChange={(e) => handleSelectChange('backupFrequency', e.target.value)}
                className="settings-select"
                disabled={!settings.autoBackup}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <h4>Data Retention</h4>
                <p>How long to keep your data</p>
              </div>
              <select
                value={settings.dataRetention}
                onChange={(e) => handleSelectChange('dataRetention', e.target.value)}
                className="settings-select"
              >
                <option value="30days">30 Days</option>
                <option value="90days">90 Days</option>
                <option value="1year">1 Year</option>
                <option value="forever">Forever</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger Zone Section */}
        <div className="settings-section danger">
          <div className="settings-section-header">
            <div className="settings-section-icon">
              <AlertCircle size={24} />
            </div>
            <div>
              <h2>Danger Zone</h2>
              <p>Irreversible actions for your account</p>
            </div>
          </div>

          <div className="settings-items">
            <div className="settings-item">
              <div className="settings-item-info">
                <Download size={18} />
                <div>
                  <h4>Export Data</h4>
                  <p>Download a copy of all your data</p>
                </div>
              </div>
              <button className="btn-export" onClick={handleExportData}>
                Export
              </button>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <Trash2 size={18} />
                <div>
                  <h4>Delete Account</h4>
                  <p>Permanently delete your account and data</p>
                </div>
              </div>
              <button className="btn-delete" onClick={handleDeleteAccount}>
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          <button className="btn-save-settings" onClick={handleSave}>
            <CheckCircle size={18} />
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
