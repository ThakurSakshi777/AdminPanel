import { useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save, Edit2, Lock } from 'lucide-react';

const Profile = () => {
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    name: localStorage.getItem('userName') || 'Admin User',
    email: localStorage.getItem('userEmail') || 'admin@rentifypro.com',
    phone: '+91 98765 43210',
    address: 'Mumbai, Maharashtra',
    role: 'Administrator',
    bio: 'Real estate admin managing properties and customer relationships.',
    company: 'RentifyPro',
    joinDate: '2024-01-15'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update localStorage
    localStorage.setItem('userName', formData.name);
    localStorage.setItem('userEmail', formData.email);
    
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <div className="profile-page">
      <div className="profile-header-section">
        <h1>My Profile</h1>
        <p>Manage your account information and preferences</p>
      </div>

      <div className="profile-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <h2>Profile Information</h2>
            <button 
              className={`btn-edit ${isEditing ? 'active' : ''}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 size={18} />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper" onClick={handleImageClick}>
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-placeholder">
                  <User size={60} />
                </div>
              )}
              <div className="profile-avatar-overlay">
                <Camera size={24} />
                <span>Change Photo</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <div className="profile-avatar-info">
              <h3>{formData.name}</h3>
              <p>{formData.role}</p>
              <span className="profile-badge">Active</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-form-grid">
              <div className="profile-form-group">
                <label>
                  <User size={18} />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label>
                  <Mail size={18} />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label>
                  <Phone size={18} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="profile-form-group">
                <label>
                  <MapPin size={18} />
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="profile-form-group">
                <label>
                  <User size={18} />
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="profile-form-group">
                <label>
                  <Lock size={18} />
                  Role
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  disabled
                />
              </div>

              <div className="profile-form-group full-width">
                <label>
                  <Edit2 size={18} />
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows="4"
                />
              </div>
            </div>

            {isEditing && (
              <div className="profile-form-actions">
                <button type="submit" className="btn-save">
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Account Stats */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h4>Total Properties</h4>
              <p className="stat-value">156</p>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h4>Total Users</h4>
              <p className="stat-value">1,234</p>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h4>Active Inquiries</h4>
              <p className="stat-value">89</p>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h4>Member Since</h4>
              <p className="stat-value">Jan 2024</p>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="profile-security-card">
          <h2>Security Settings</h2>
          <div className="security-items">
            <div className="security-item">
              <div className="security-item-info">
                <Lock size={20} />
                <div>
                  <h4>Password</h4>
                  <p>Last changed 30 days ago</p>
                </div>
              </div>
              <button className="btn-change">Change Password</button>
            </div>

            <div className="security-item">
              <div className="security-item-info">
                <Mail size={20} />
                <div>
                  <h4>Email Verification</h4>
                  <p>Your email is verified</p>
                </div>
              </div>
              <span className="verified-badge">✓ Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
