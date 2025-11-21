import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { 
  Home, 
  Users, 
  Building2, 
  MapPin, 
  Mail, 
  AlertTriangle, 
  Wrench, 
  Shield 
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard', emoji: '🏠' },
    { path: '/users', icon: Users, label: 'Users', emoji: '👤' },
    { path: '/properties', icon: Building2, label: 'Properties', emoji: '🏘' },
    { path: '/listings', icon: MapPin, label: 'Listings', emoji: '📍' },
    { path: '/inquiries', icon: Mail, label: 'Inquiries', emoji: '📨' },
    { path: '/complaints', icon: AlertTriangle, label: 'Complaints', emoji: '⚠' },
    { path: '/services', icon: Wrench, label: 'Services', emoji: '🛠' },
    { path: '/security', icon: Shield, label: 'Security', emoji: '🔐' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Mobile Close Button */}
      <button className="sidebar-close-mobile" onClick={onClose}>
        <X size={24} />
      </button>

      <div className="sidebar-header">
        <h2>🏢 Sequence</h2>
        <button className="menu-toggle">☰</button>
      </div>
      <div className="sidebar-section">
        <p className="section-label">GENERAL</p>
        <nav className="sidebar-nav">
          {menuItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-emoji">{item.emoji}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="sidebar-section">
        <p className="section-label">SUPPORT</p>
        <nav className="sidebar-nav">
          {menuItems.slice(4).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-emoji">{item.emoji}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="sidebar-footer">
        <div className="pro-badge">
          <span className="pro-icon">⚡</span>
          <div>
            <p className="pro-title">Earn <span className="pro-amount">₹140</span></p>
            <p className="pro-subtitle">Upgrade to Pro Mode</p>
          </div>
        </div>
        <div className="user-profile">
          <div className="profile-avatar">YA</div>
          <div>
            <p className="profile-name">Young Alaska</p>
            <p className="profile-email">alaska@gmail.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
