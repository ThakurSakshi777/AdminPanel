import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, FolderOpen, ChevronDown, ChevronUp, Plus, Calendar, Users, AlertCircle, TrendingUp, MessageSquare, Save, X as XIcon } from 'lucide-react';
import { getMyProfile, getMyProjects, updateProjectProgress } from '../services/hrService';
import EmployeeSidebar from '../components/EmployeeSidebar';

const EmployeeProjects = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedProject, setExpandedProject] = useState(null);
  const [showAddNote, setShowAddNote] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editProgress, setEditProgress] = useState(0);
  const [savingId, setSavingId] = useState(null);
  const [employeeData, setEmployeeData] = useState({
    name: 'Employee',
    avatar: 'E',
    jobTitle: 'Employee',
    department: 'N/A',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const profileRes = await getMyProfile();
        if (profileRes.success) {
          setEmployeeData({
            name: profileRes.data.name,
            avatar: profileRes.data.name?.charAt(0).toUpperCase(),
            jobTitle: profileRes.data.position || 'Employee',
            department: profileRes.data.department || 'N/A',
          });
        }

        const projectRes = await getMyProjects();
        console.log('Projects response:', projectRes);
        if (projectRes.success) {
          const projectsArray = Array.isArray(projectRes.data) ? projectRes.data : [];
          setProjects(projectsArray);
        } else {
          setError('Failed to load projects');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error loading data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'In Progress').length,
    completed: projects.filter(p => p.status === 'Completed').length,
    onHold: projects.filter(p => p.status === 'On Hold').length,
    avgProgress: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length) : 0
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#10b981';
      case 'In Progress':
        return '#3b82f6';
      case 'On Hold':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const handleStartEditingProgress = (projectId, currentProgress) => {
    setEditingProjectId(projectId);
    setEditProgress(currentProgress);
  };

  const handleCancelEditProgress = () => {
    setEditingProjectId(null);
    setEditProgress(0);
  };

  const handleSaveProgress = async (projectId) => {
    try {
      setSavingId(projectId);
      const response = await updateProjectProgress(projectId, editProgress);
      
      if (response.success) {
        // Update the projects list with new data
        setProjects(projects.map(p => 
          p.id === projectId 
            ? { ...p, progress: editProgress, status: response.data?.status || p.status }
            : p
        ));
        setEditingProjectId(null);
        setEditProgress(0);
        console.log('✅ Project progress updated successfully');
      } else {
        alert('Failed to update progress: ' + (response.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      alert('Error updating progress');
    } finally {
      setSavingId(null);
    }
  };

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
        <EmployeeSidebar isSidebarOpen={isSidebarOpen} employeeData={employeeData} activePage="projects" />
      </aside>

      <main className="employee-main">
        <section className="emp-welcome">
          <div>
            <h2>My Projects 📦</h2>
            <p>Track your assigned projects and progress</p>
          </div>
        </section>

        {loading && <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading projects...</div>}
        {error && <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px' }}>⚠️ {error}</div>}

        {!loading && (
          <>
            {/* Statistics Cards */}
            <div className="emp-content-grid" style={{ marginBottom: '30px' }}>
              {/* Total Projects */}
              <div className="emp-card" style={{ backgroundColor: '#ecf0f1', borderLeft: '5px solid #3498db' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '10px' }}>Total Projects</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3498db' }}>{projectStats.total}</div>
                  </div>
                  <div style={{ fontSize: '40px', color: '#3498db', opacity: 0.2 }}>📁</div>
                </div>
              </div>

              {/* Active Projects */}
              <div className="emp-card" style={{ backgroundColor: '#ecf0f1', borderLeft: '5px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '10px' }}>Active Projects</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{projectStats.active}</div>
                  </div>
                  <div style={{ fontSize: '40px', color: '#10b981', opacity: 0.2 }}>⚡</div>
                </div>
              </div>

              {/* Average Progress */}
              <div className="emp-card" style={{ backgroundColor: '#ecf0f1', borderLeft: '5px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '10px' }}>Avg Progress</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{projectStats.avgProgress}%</div>
                  </div>
                  <div style={{ fontSize: '40px', color: '#f59e0b', opacity: 0.2 }}>📊</div>
                </div>
              </div>

              {/* Completed Projects */}
              <div className="emp-card" style={{ backgroundColor: '#ecf0f1', borderLeft: '5px solid #8b5cf6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '10px' }}>Completed</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' }}>{projectStats.completed}</div>
                  </div>
                  <div style={{ fontSize: '40px', color: '#8b5cf6', opacity: 0.2 }}>✓</div>
                </div>
              </div>
            </div>

            {/* Projects List */}
            <div className="emp-content-grid">
              <section className="emp-section" style={{ gridColumn: '1 / -1' }}>
                <div className="emp-widget">
                  <h3>📦 Assigned Projects</h3>
              {projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  <FolderOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p>No projects assigned yet</p>
                </div>
              ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {projects.map(project => (
                  <div 
                    key={project.id} 
                    style={{ 
                      background: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div 
                      onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                      style={{
                        padding: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: expandedProject === project.id ? '1px solid #e5e7eb' : 'none'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                          {project.name}
                        </h4>
                        <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                          {project.description}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '20px' }}>
                        <span 
                          style={{ 
                            padding: '6px 12px', 
                            borderRadius: '6px', 
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'white',
                            backgroundColor: getStatusColor(project.status)
                          }}
                        >
                          {project.status}
                        </span>
                        {expandedProject === project.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>

                    <div style={{ padding: '12px 20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      {editingProjectId === project.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={editProgress}
                            onChange={(e) => setEditProgress(parseInt(e.target.value))}
                            style={{ flex: 1, height: '6px', borderRadius: '3px', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151', minWidth: '80px', textAlign: 'right' }}>
                            {editProgress}%
                          </span>
                          <button
                            onClick={() => handleSaveProgress(project.id)}
                            disabled={savingId === project.id}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: savingId === project.id ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              opacity: savingId === project.id ? 0.6 : 1
                            }}
                          >
                            <Save size={14} />
                            {savingId === project.id ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancelEditProgress}
                            disabled={savingId === project.id}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: savingId === project.id ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              opacity: savingId === project.id ? 0.6 : 1
                            }}
                          >
                            <XIcon size={14} />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ flex: 1, height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                height: '100%', 
                                width: `${project.progress}%`,
                                backgroundColor: getStatusColor(project.status),
                                transition: 'width 0.3s'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151', minWidth: '80px', textAlign: 'right' }}>
                            {project.progress}% Complete
                          </span>
                          <button
                            onClick={() => handleStartEditingProgress(project.id, project.progress)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            Edit Progress
                          </button>
                        </div>
                      )}
                    </div>

                    {expandedProject === project.id && (
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                          <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>Team Size</div>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>{project.teamSize} members</div>
                          </div>
                          <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>Due Date</div>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>{new Date(project.endDate).toLocaleDateString()}</div>
                          </div>
                          <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>Priority</div>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>{project.priority}</div>
                          </div>
                          <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>Budget</div>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>₹{project.budget?.toLocaleString() || '0'}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>Project Details</h4>
                          </div>
                          <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>
                            <p><strong>My Role:</strong> {project.myRole}</p>
                            <p><strong>Start Date:</strong> {new Date(project.startDate).toLocaleDateString()}</p>
                            {project.remarks && <p><strong>Remarks:</strong> {project.remarks}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}
            </div>
            </section>
          </div>
          </>
        )}
      </main>
    </div>
  );
};

export default EmployeeProjects;
