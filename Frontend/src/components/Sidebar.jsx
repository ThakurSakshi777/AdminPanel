import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Users, 
  Briefcase, 
  Calendar, 
  User, 
  Award,
  Bell,
  FileText,
  Mail,

} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const handleNavClick = () => {
    // Check if mobile/tablet (screen width < 1024px)
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const menuItems = [
    { 
      section: 'DASHBOARD',
      items: [
        { path: '/dashboard', icon: Home, label: 'Dashboard', emoji: '🏠' },
      ]
    },
    {
      section: 'HR MANAGEMENT',
      items: [
        { path: '/employees', icon: Users, label: 'Employees', emoji: '👥' },
        { path: '/employee-profile', icon: User, label: 'Employee Profile', emoji: '👤' },
        { path: '/leaves', icon: Calendar, label: 'Leave Management', emoji: '📅' },
        { path: '/salary-slip-management', icon: Users, label: 'Salary Slips', emoji: '💰' },
      ]
    },
    {
      section: 'OPERATIONS',
      items: [
        { path: '/projects', icon: Briefcase, label: 'Projects', emoji: '📋' },
        { path: '/performance', icon: Award, label: 'Performance', emoji: '⭐' },
      ]
    },
    {
      section: 'COMMUNICATIONS',
      items: [
        { path: '/announcements', icon: Bell, label: 'Announcements', emoji: '📢' },
        // { path: '/documents', icon: FileText, label: 'Documents', emoji: '📄' },
        { path: '/letters', icon: Mail, label: 'Letters', emoji: '📧' },
      ]
    }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Close Button - Desktop & Mobile */}
      <button className="sidebar-close-btn" onClick={onClose}>
        <X size={20} />
      </button>

      <div className="sidebar-header">
        <h2>🏢 HRMS</h2>
      </div>

      {menuItems.map((section, idx) => (
        <div key={idx} className="sidebar-section">
          <p className="section-label">{section.section}</p>
          <nav className="sidebar-nav">
            {section.items.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={handleNavClick}
                  title={item.label}
                >
                  <span className="nav-emoji">{item.emoji}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      ))}

      <div className="sidebar-footer">
        <div className="pro-badge">
          <span className="pro-icon">⚡</span>
          <div>
            <p className="pro-title">Version <span className="pro-amount">2.0</span></p>
            <p className="pro-subtitle">HRMS</p>
          </div>
        </div>
        <div className="user-profile">
          <div className="profile-avatar">
            {(user?.name || localStorage.getItem('userName') || 'User')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </div>
          <div>
            <p className="profile-name">{user?.name || localStorage.getItem('userName') || 'User'}</p>
            <p className="profile-email">{user?.email || localStorage.getItem('userEmail') || 'user@example.com'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
