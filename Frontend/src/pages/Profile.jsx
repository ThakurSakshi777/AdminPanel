import { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save, Edit2, Lock, Briefcase, Calendar, Building } from 'lucide-react';
import { getMyProfile, updateMyProfile } from '../services/hrService';

const Profile = () => {
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    role: '',
    employeeId: '',
    joinDate: '',
    isActive: true
  });

  // Load profile data on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      const profileData = await getMyProfile();
      
      // Format joinDate for date input (YYYY-MM-DD)
      let formattedJoinDate = '';
      if (profileData.joinDate) {
        const date = new Date(profileData.joinDate);
        formattedJoinDate = date.toISOString().split('T')[0];
      }
      
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        department: profileData.department || '',
        position: profileData.position || '',
        role: profileData.role || 'employee',
        employeeId: profileData.employeeId || '',
        joinDate: formattedJoinDate,
        isActive: profileData.isActive !== false
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      // Set default values if API fails
      const storedName = localStorage.getItem('userName') || 'User';
      const storedEmail = localStorage.getItem('userEmail') || 'user@example.com';
      setFormData(prev => ({
        ...prev,
        name: storedName,
        email: storedEmail
      }));
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        position: formData.position,
        role: formData.role,
        employeeId: formData.employeeId,
        joinDate: formData.joinDate
      };

      const result = await updateMyProfile(updateData);
      
      if (result.success) {
        // Update localStorage with all new data
        localStorage.setItem('userName', formData.name);
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('userPhone', formData.phone);
        localStorage.setItem('userDepartment', formData.department);
        localStorage.setItem('userPosition', formData.position);
        localStorage.setItem('userRole', formData.role);
        localStorage.setItem('employeeId', formData.employeeId);
        localStorage.setItem('joinDate', formData.joinDate);
        
        setIsEditing(false);
        alert('Profile updated successfully! The changes will reflect across the app.');
        
        // Reload the page to reflect changes everywhere
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        alert('Error updating profile: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header-section">
        <h1>My Profile</h1>
        <p>Manage your account information and preferences</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading profile...</p>
        </div>
      ) : (
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
              <p>{formData.role} - {formData.position}</p>
              <div className="profile-hr-badges">
                <span className="profile-badge">Active</span>
                <span className="profile-badge hr-badge">🏢 {formData.department}</span>
              </div>
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
                  <Building size={18} />
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="profile-form-group">
                <label>
                  <Briefcase size={18} />
                  Position
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="profile-form-group">
                <label>
                  <Lock size={18} />
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value="employee">Employee</option>
                  <option value="hr">HR</option>
                  <option value="tl">Team Lead</option>
                </select>
              </div>

              <div className="profile-form-group">
                <label>
                  <User size={18} />
                  Employee ID
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="profile-form-group">
                <label>
                  <Calendar size={18} />
                  Join Date
                </label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                  disabled={!isEditing}
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
      </div>
      )}
    </div>
  );
};

export default Profile;
