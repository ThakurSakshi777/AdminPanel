import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Bell, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { getPublishedAnnouncements, getMyProfile } from '../services/hrService';
import EmployeeSidebar from '../components/EmployeeSidebar';

const EmployeeAnnouncements = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployeeData();
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getPublishedAnnouncements();
      
      if (response && response.success) {
        const announcementsArray = Array.isArray(response.data) ? response.data : [];
        setAnnouncements(announcementsArray);
      } else if (Array.isArray(response)) {
        // Direct array response from API
        setAnnouncements(response);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      setError('Failed to load announcements');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeData = async () => {
    try {
      const profileRes = await getMyProfile();
      if (profileRes.success && profileRes.data) {
        setEmployeeData({
          name: profileRes.data.name,
          avatar: profileRes.data.name?.charAt(0).toUpperCase(),
          jobTitle: profileRes.data.position || 'Employee',
          department: profileRes.data.department || 'N/A',
        });
      } else {
        setEmployeeData({
          name: 'Employee',
          avatar: 'E',
          jobTitle: 'Employee',
          department: 'N/A',
        });
      }
    } catch (err) {
      console.error('Error fetching employee data:', err);
      setEmployeeData({
        name: 'Employee',
        avatar: 'E',
        jobTitle: 'Employee',
        department: 'N/A',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Urgent': return '#ef4444';
      case 'High': return '#f97316';
      case 'Medium': return '#eab308';
      case 'Low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesPriority = selectedPriority === 'All' || announcement.priority === selectedPriority;
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  const urgentCount = announcements.filter(a => a.priority === 'Urgent').length;
  const recentCount = announcements.filter(a => {
    const createdAt = new Date(a.createdAt);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return createdAt > sevenDaysAgo;
  }).length;

  return (
    <div className="employee-dashboard">
      <header className="employee-header">
        <div className="employee-header-left">
          <button 
            className="emp-menu-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1>🏢 HRMS</h1>
        </div>
        <div className="employee-header-right">
          <button 
            className="emp-logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <aside className={`employee-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <EmployeeSidebar isSidebarOpen={isSidebarOpen} employeeData={employeeData} activePage="announcements" />
      </aside>

      <main className="employee-main">
        <section className="emp-welcome">
          <div>
            <h2>Latest Announcements 📢</h2>
            <p>Stay updated with company announcements and important notices</p>
          </div>
        </section>

        <section className="emp-cards-grid">
          <div className="emp-card leave-card">
            <div className="card-icon">
              <Bell size={28} style={{ color: '#f59e0b' }} />
            </div>
            <div className="card-content">
              <h3>Total Announcements</h3>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginTop: '8px' }}>
                {announcements.length}
              </div>
            </div>
          </div>

          <div className="emp-card attendance-card">
            <div className="card-icon">
              <Bell size={28} style={{ color: '#3b82f6' }} />
            </div>
            <div className="card-content">
              <h3>Urgent</h3>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', marginTop: '8px' }}>
                {urgentCount}
              </div>
            </div>
          </div>

          <div className="emp-card performance-card">
            <div className="card-icon">
              <Bell size={28} style={{ color: '#10b981' }} />
            </div>
            <div className="card-content">
              <h3>Last 7 Days</h3>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginTop: '8px' }}>
                {recentCount}
              </div>
            </div>
          </div>
        </section>

        <div className="emp-content-grid">
          <section className="emp-section" style={{ gridColumn: '1 / -1' }}>
            <div className="emp-widget">
              <h3 style={{ marginBottom: '20px' }}>📢 All Announcements</h3>
              
              {error && <div style={{ padding: '15px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px' }}>⚠️ {error}</div>}

              {/* Filter and Search Section */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '250px', display: 'flex', alignItems: 'center', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0 12px' }}>
                  <Search size={18} style={{ color: '#9ca3af' }} />
                  <input 
                    type="text"
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ border: 'none', background: 'transparent', padding: '10px 12px', width: '100%', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['All', 'Urgent', 'High', 'Medium', 'Low'].map(priority => (
                    <button
                      key={priority}
                      onClick={() => setSelectedPriority(priority)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: selectedPriority === priority ? 'none' : '1px solid #e5e7eb',
                        background: selectedPriority === priority ? '#667eea' : 'white',
                        color: selectedPriority === priority ? 'white' : '#6b7280',
                        fontSize: '13px',
                        fontWeight: selectedPriority === priority ? '600' : '500',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => { if (selectedPriority !== priority) { e.target.style.borderColor = '#667eea'; e.target.style.color = '#667eea'; }}}
                      onMouseLeave={(e) => { if (selectedPriority !== priority) { e.target.style.borderColor = '#e5e7eb'; e.target.style.color = '#6b7280'; }}}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Loading announcements...</div>
              ) : filteredAnnouncements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  <Bell size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p>No announcements found</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredAnnouncements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((announcement) => (
                    <div 
                      key={announcement._id}
                      style={{
                        background: expandedId === announcement._id ? '#fffbeb' : 'white',
                        border: `1px solid ${expandedId === announcement._id ? '#fbbf24' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onClick={() => setExpandedId(expandedId === announcement._id ? null : announcement._id)}
                      onMouseEnter={(e) => { if (expandedId !== announcement._id) { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}}
                      onMouseLeave={(e) => { if (expandedId !== announcement._id) { e.currentTarget.style.boxShadow = 'none'; }}}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                          <div style={{ fontSize: '28px', minWidth: '40px' }}>📢</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                                {announcement.title}
                              </div>
                              <span 
                                style={{ 
                                  padding: '3px 8px', 
                                  borderRadius: '4px', 
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  color: 'white',
                                  backgroundColor: getPriorityColor(announcement.priority)
                                }}
                              >
                                {announcement.priority}
                              </span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
                              {new Date(announcement.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })} {new Date(announcement.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                              Audience: <span style={{ fontWeight: '600', color: '#374151' }}>{announcement.audience}</span>
                            </div>
                            {expandedId === announcement._id && (
                              <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6', marginTop: '12px', padding: '12px', background: '#f9fafb', borderRadius: '6px', borderLeft: '3px solid #667eea' }}>
                                {announcement.content}
                              </div>
                            )}
                          </div>
                        </div>
                        <button 
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#667eea',
                            padding: '0',
                            minWidth: '24px'
                          }}
                        >
                          {expandedId === announcement._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default EmployeeAnnouncements;
