import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, DollarSign, Download, FileText, TrendingUp } from 'lucide-react';
import { getMyProfile, getMySalary, getMySalarySlips } from '../services/hrService';

const EmployeeSalary = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedSlip, setExpandedSlip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [salarySlips, setSalarySlips] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await getMyProfile();
        if (profileRes.success) {
          setEmployeeData({
            name: profileRes.data.name,
            avatar: profileRes.data.name?.charAt(0).toUpperCase(),
            jobTitle: profileRes.data.position || 'Employee',
            department: profileRes.data.department || 'N/A',
          });
        }

        const salaryRes = await getMySalary();
        if (salaryRes.success) {
          setSalaryData(salaryRes.data);
        }

        const slipsRes = await getMySalarySlips();
        if (slipsRes.success) {
          setSalarySlips(slipsRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching salary data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading salary data...</div>;
  if (!employeeData) return <div style={{ textAlign: 'center', padding: '40px' }}>No data available</div>;

  const recentSalarySlips = salarySlips.map(slip => ({
    id: slip._id,
    month: slip.month || 'N/A',
    salary: slip.netSalary || 0,
    status: 'Processed',
    date: slip.generatedDate || new Date().toISOString().split('T')[0],
    breakdown: {
      basic: slip.basicSalary || 0,
      hra: slip.hra || 0,
      dearness: slip.da || 0,
      allowance: slip.allowances || 0,
      deductions: slip.deductions || 0
    }
  })) || [];

  const annualSalary = (salaryData?.salary || 0) * 12;

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
        <div className="emp-profile-card">
          <div className="emp-avatar">{employeeData.avatar}</div>
          <h3>{employeeData.name}</h3>
          <p>{employeeData.jobTitle}</p>
          <p className="emp-dept">{employeeData.department}</p>
        </div>

        <nav className="emp-nav">
          <button 
            onClick={() => navigate('/employee-dashboard')}
            className="emp-nav-item"
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '6px', fontSize: '14px', color: '#6b7280', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#f3f4f6'; e.target.style.color = '#667eea'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#6b7280'; }}
          >
            📊 Dashboard
          </button>
          <button 
            onClick={() => navigate('/employee/attendance')}
            className="emp-nav-item"
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '6px', fontSize: '14px', color: '#6b7280', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#f3f4f6'; e.target.style.color = '#667eea'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#6b7280'; }}
          >
            📅 My Attendance
          </button>
          <button 
            onClick={() => navigate('/employee/leaves')}
            className="emp-nav-item"
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '6px', fontSize: '14px', color: '#6b7280', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#f3f4f6'; e.target.style.color = '#667eea'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#6b7280'; }}
          >
            📋 My Leave Requests
          </button>
          <button 
            onClick={() => navigate('/employee/projects')}
            className="emp-nav-item"
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '6px', fontSize: '14px', color: '#6b7280', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#f3f4f6'; e.target.style.color = '#667eea'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#6b7280'; }}
          >
            📦 My Projects
          </button>
          <button 
            onClick={() => navigate('/employee/performance')}
            className="emp-nav-item"
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '6px', fontSize: '14px', color: '#6b7280', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#f3f4f6'; e.target.style.color = '#667eea'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#6b7280'; }}
          >
            ⭐ Performance
          </button>
          <button 
            onClick={() => navigate('/employee/announcements')}
            className="emp-nav-item"
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '6px', fontSize: '14px', color: '#6b7280', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#f3f4f6'; e.target.style.color = '#667eea'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#6b7280'; }}
          >
            📢 Announcements
          </button>
        </nav>
      </aside>

      <main className="employee-main">
        <section className="emp-welcome">
          <div>
            <h2>My Salary Slips 💰</h2>
            <p>View and download your salary slips</p>
          </div>
        </section>

        <section className="emp-cards-grid">
          <div className="emp-card leave-card">
            <div className="card-icon">
              <DollarSign size={28} style={{ color: '#10b981' }} />
            </div>
            <div className="card-content">
              <h3>Latest Salary</h3>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981', marginTop: '8px' }}>
                ₹85,000
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>November 2024</div>
            </div>
          </div>

          <div className="emp-card attendance-card">
            <div className="card-icon">
              <TrendingUp size={28} style={{ color: '#3b82f6' }} />
            </div>
            <div className="card-content">
              <h3>Annual Salary</h3>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6', marginTop: '8px' }}>
                ₹{annualSalary.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="emp-card performance-card">
            <div className="card-icon">
              <FileText size={28} style={{ color: '#f59e0b' }} />
            </div>
            <div className="card-content">
              <h3>Total Slips</h3>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b', marginTop: '8px' }}>
                {recentSalarySlips.length}
              </div>
            </div>
          </div>
        </section>

        <div className="emp-content-grid">
          <section className="emp-section" style={{ gridColumn: '1 / -1' }}>
            <div className="emp-widget">
              <h3 style={{ marginBottom: '20px' }}>📄 My Salary Slips</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentSalarySlips.map((slip) => (
                  <div 
                    key={slip.id}
                    style={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onClick={() => setExpandedSlip(expandedSlip === slip.id ? null : slip.id)}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>{slip.month}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Processed on {slip.date}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>₹{slip.salary.toLocaleString()}</div>
                          <div style={{ fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', marginTop: '4px', fontWeight: '600', display: 'inline-block' }}>
                            ✓ {slip.status}
                          </div>
                        </div>
                        <button 
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Download size={16} /> Download
                        </button>
                      </div>
                    </div>

                    {expandedSlip === slip.id && (
                      <div style={{ marginTop: '16px', padding: '16px', background: '#f9fafb', borderRadius: '6px', borderTop: '1px solid #e5e7eb' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>Salary Breakdown</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Basic Salary</div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>₹{slip.breakdown.basic.toLocaleString()}</div>
                          </div>
                          <div style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>HRA</div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>₹{slip.breakdown.hra.toLocaleString()}</div>
                          </div>
                          <div style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Dearness Allowance</div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>₹{slip.breakdown.dearness.toLocaleString()}</div>
                          </div>
                          <div style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Other Allowance</div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>₹{slip.breakdown.allowance.toLocaleString()}</div>
                          </div>
                          <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Deductions</div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#dc2626' }}>₹{slip.breakdown.deductions.toLocaleString()}</div>
                          </div>
                          <div style={{ background: '#f0f4ff', padding: '12px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                            <div style={{ fontSize: '12px', color: '#1e40af', marginBottom: '4px', fontWeight: '600' }}>Net Salary</div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#667eea' }}>₹{(slip.salary - slip.breakdown.deductions).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default EmployeeSalary;
