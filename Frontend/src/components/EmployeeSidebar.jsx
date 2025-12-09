import { useNavigate } from 'react-router-dom';

const EmployeeSidebar = ({ isSidebarOpen, employeeData, activePage }) => {
  const navigate = useNavigate();

  const navItems = [
    { label: '📊 Dashboard', path: '/employee-dashboard', id: 'dashboard' },
    { label: '📅 My Attendance', path: '/employee/attendance', id: 'attendance' },
    { label: '📋 My Leave Requests', path: '/employee/leaves', id: 'leaves' },
    { label: '📦 My Projects', path: '/employee/projects', id: 'projects' },
    { label: '⭐ Performance', path: '/employee/performance', id: 'performance' },
    { label: '📢 Announcements', path: '/employee/announcements', id: 'announcements' },
    { label: '📄 My Documents', path: '/employee/documents', id: 'documents' },
    { label: '📧 My Letters', path: '/employee-letters', id: 'letters' },
  ];

  const baseButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  };

  const activeButtonStyle = {
    background: '#f0f4ff',
    color: '#667eea',
    fontWeight: '600'
  };

  const inactiveButtonStyle = {
    color: '#6b7280'
  };

  return (
    <aside className={`employee-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
      <div className="emp-profile-card">
        <div className="emp-avatar">{employeeData?.avatar}</div>
        <h3>{employeeData?.name}</h3>
        <p>{employeeData?.jobTitle}</p>
        <p className="emp-dept">{employeeData?.department}</p>
      </div>

      <nav className="emp-nav">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`emp-nav-item ${isActive ? 'active' : ''}`}
              style={{
                ...baseButtonStyle,
                ...(isActive ? activeButtonStyle : inactiveButtonStyle)
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.color = '#667eea';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#6b7280';
                }
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default EmployeeSidebar;
