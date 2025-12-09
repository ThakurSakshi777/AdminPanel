import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Mail, Calendar, AlertCircle, CheckCircle, Eye, Menu, X, LogOut } from 'lucide-react';
import { getMyProfile } from '../services/hrService';
import EmployeeSidebar from '../components/EmployeeSidebar';
import '../styles/EmployeeLetters.css';
import * as hrService from '../services/hrService';

const EmployeeLetters = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [employeeData, setEmployeeData] = useState({
    name: 'Employee',
    avatar: 'E',
    jobTitle: 'Employee',
    department: 'N/A',
  });

  const letterTypeLabels = {
    offer: '📄 Offer Letter',
    joining: '📋 Joining Letter',
    confirmation: '✓ Confirmation Letter',
    promotion: '⬆️ Promotion Letter',
    increment: '📈 Increment Letter',
    pip: '⚠️ PIP Letter',
    warning: '⛔ Warning Letter',
    experience: '🎓 Experience Letter',
    internship: '👨‍🎓 Internship Letter',
  };

  const statusColors = {
    draft: { bg: '#eee', text: '#666', label: '📋 Draft' },
    sent: { bg: '#efe', text: '#3c3', label: '📤 Sent' },
    downloaded: { bg: '#eef', text: '#36f', label: '✅ Downloaded' },
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  // Fetch employee profile and letters on mount
  useEffect(() => {
    fetchEmployeeData();
    fetchLetters();
  }, []);

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
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const data = await hrService.getEmployeeLetters();
      if (data.success || data.letters) {
        setLetters(data.data || data.letters || []);
      } else {
        setError(data.message || 'Failed to fetch letters');
      }
    } catch (err) {
      setError('Error fetching letters: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLetter = async (letterId) => {
    try {
      const blob = await hrService.downloadLetter(letterId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `letter-${letterId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Refresh to show updated status
      fetchLetters();
    } catch (err) {
      alert('Error downloading letter: ' + err.message);
    }
  };

  const handleViewLetter = async (letter) => {
    setSelectedLetter(letter);
    
    // Mark as viewed
    try {
      await hrService.viewLetter(letter._id);
    } catch (err) {
      console.error('Error marking as viewed:', err);
    }
  };

  // Filter letters
  const filteredLetters = filterType
    ? letters.filter(l => l.letterType === filterType)
    : letters;

  // Get unique letter types
  const uniqueTypes = [...new Set(letters.map(l => l.letterType))];

  if (loading) {
    return (
      <div className="letters-container">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>📧</div>
          <div>Loading your letters...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`employee-page-wrapper ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
      {/* Top Navigation Header */}
      <header className="employee-header">
        <div className="employee-header-left">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#333' }}>🏢 HRMS</h1>
        </div>
        <div className="employee-header-right">
          <button
            onClick={handleLogout}
            className="logout-btn"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              color: '#666',
              padding: '8px 12px',
              borderRadius: '6px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => (e.target.style.background = '#fee')}
            onMouseLeave={(e) => (e.target.style.background = 'none')}
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`employee-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <EmployeeSidebar
          isSidebarOpen={isSidebarOpen}
          employeeData={employeeData}
          activePage="letters"
        />
      </aside>

      {/* Main Content */}
      <main className="employee-main-content">
        {/* Header */}
        <div className="letters-header">
          <div>
            <h1>📧 My Letters</h1>
            <p>View and download official documents from HR</p>
          </div>
          <div className="letter-count">
            <span className="count-badge">{letters.length}</span>
            <span className="count-label">Total Letters</span>
          </div>
        </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      {uniqueTypes.length > 0 && (
        <div className="filter-bar">
          <div className="filter-label">Filter by Type:</div>
          <button
            className={`filter-btn ${!filterType ? 'active' : ''}`}
            onClick={() => setFilterType('')}
          >
            All ({letters.length})
          </button>
          {uniqueTypes.map(type => (
            <button
              key={type}
              className={`filter-btn ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {letterTypeLabels[type]?.split(' ')[0]} ({letters.filter(l => l.letterType === type).length})
            </button>
          ))}
        </div>
      )}

      <div className="letters-main-layout">
        {/* Letters List */}
        <div className="letters-list-section">
          {filteredLetters.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p className="empty-title">No Letters Yet</p>
              <p className="empty-subtitle">
                {filterType ? 'No letters of this type' : 'HR will send you official letters here'}
              </p>
            </div>
          ) : (
            <div className="letters-grid">
              {filteredLetters.map(letter => (
                <div key={letter._id} className="letter-item">
                  <div className="letter-item-header">
                    <div className="letter-type-info">
                      <div className="letter-type-icon">
                        {letterTypeLabels[letter.letterType]?.split(' ')[0]}
                      </div>
                      <div className="letter-type-text">
                        <h3>{letterTypeLabels[letter.letterType]}</h3>
                        <p className="letter-date">
                          <Calendar size={14} />
                          {new Date(letter.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: statusColors[letter.status]?.bg,
                        color: statusColors[letter.status]?.text,
                      }}
                    >
                      {statusColors[letter.status]?.label}
                    </span>
                  </div>

                  <div className="letter-item-content">
                    <div className="letter-meta">
                      {letter.sentAt && (
                        <span className="meta-tag">
                          <Mail size={12} /> Sent on {new Date(letter.sentAt).toLocaleDateString()}
                        </span>
                      )}
                      {letter.downloadedAt && (
                        <span className="meta-tag downloaded">
                          <Download size={12} /> Downloaded
                        </span>
                      )}
                      {letter.viewedByEmployee && (
                        <span className="meta-tag viewed">
                          <Eye size={12} /> Viewed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="letter-item-actions">
                    <button
                      className="btn-action btn-view"
                      onClick={() => handleViewLetter(letter)}
                      title="View letter"
                    >
                      <Eye size={16} /> View
                    </button>
                    <button
                      className="btn-action btn-download"
                      onClick={() => handleDownloadLetter(letter._id)}
                      title="Download as PDF"
                    >
                      <Download size={16} /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Letter Preview */}
        {selectedLetter && (
          <div className="letter-preview-section">
            <div className="preview-header">
              <h3>Letter Preview</h3>
              <button
                className="btn-close"
                onClick={() => setSelectedLetter(null)}
                title="Close preview"
              >
                ✕
              </button>
            </div>

            <div className="preview-content">
              <div className="preview-title">
                {letterTypeLabels[selectedLetter.letterType]}
              </div>

              <div className="preview-details">
                <div className="detail-row">
                  <span className="detail-label">Letter Type:</span>
                  <span className="detail-value">{selectedLetter.letterType}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span
                    className="detail-value"
                    style={{
                      color: statusColors[selectedLetter.status]?.text,
                    }}
                  >
                    {statusColors[selectedLetter.status]?.label}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Generated On:</span>
                  <span className="detail-value">
                    {new Date(selectedLetter.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {selectedLetter.sentAt && (
                  <div className="detail-row">
                    <span className="detail-label">Sent On:</span>
                    <span className="detail-value">
                      {new Date(selectedLetter.sentAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="preview-letter-content">
                <h4>Letter Information</h4>
                <div className="info-box">
                  {Object.entries(selectedLetter.letterData || {}).map(([key, value]) => (
                    <div key={key} className="info-row">
                      <span className="info-key">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}:</span>
                      <span className="info-value">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="preview-actions">
                <button
                  className="btn-primary"
                  onClick={() => handleDownloadLetter(selectedLetter._id)}
                >
                  <Download size={18} /> Download Letter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      {letters.length > 0 && (
        <div className="letters-stats">
          <div className="stat-item">
            <div className="stat-number">
              {letters.filter(l => l.status === 'sent' || l.status === 'downloaded').length}
            </div>
            <div className="stat-label">Received</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{letters.filter(l => l.status === 'downloaded').length}</div>
            <div className="stat-label">Downloaded</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{letters.filter(l => l.viewedByEmployee).length}</div>
            <div className="stat-label">Viewed</div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
};

export default EmployeeLetters;
