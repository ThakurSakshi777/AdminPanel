import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Clock, Calendar, TrendingUp, Check, AlertCircle } from 'lucide-react';
import { getMyProfile, getMyAttendance } from '../services/hrService';
import EmployeeSidebar from '../components/EmployeeSidebar';

const EmployeeAttendance = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format

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

        const attendanceRes = await getMyAttendance();
        if (attendanceRes.success) {
          // API returns: data (array of records), statistics (stats object)
          const records = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];
          const stats = attendanceRes.statistics || {};
          
          // Calculate statistics from records
          let presentCount = 0;
          let absentCount = 0;
          let leaveCount = 0;
          let totalHours = 0;

          records.forEach(record => {
            const status = record.status?.toLowerCase() || '';
            if (status === 'present' || status === 'late') {
              presentCount++;
            } else if (status === 'absent') {
              absentCount++;
            } else if (status === 'leave' || status === 'on leave') {
              leaveCount++;
            }
            totalHours += record.workingHours || 0;
          });

          const totalDays = records.length;
          const attendancePercentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;
          const avgHours = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0;

          // Calculate monthly trend from records
          const monthlyData = {};
          records.forEach(record => {
            if (record.date) {
              const date = new Date(record.date);
              const monthKey = date.toLocaleString('en-US', { month: 'short' });
              if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { count: 0, present: 0 };
              }
              monthlyData[monthKey].count++;
              const recordStatus = record.status?.toLowerCase() || '';
              if (recordStatus === 'present' || recordStatus === 'late') {
                monthlyData[monthKey].present++;
              }
            }
          });

          const monthlyTrend = Object.entries(monthlyData)
            .map(([month, data]) => ({
              month,
              attendance: Math.round((data.present / data.count) * 100)
            }))
            .slice(-3); // Last 3 months

          setAttendanceStats({
            percentage: attendancePercentage,
            presentDays: presentCount,
            absentDays: absentCount,
            leaveDays: leaveCount,
            onTimeArrival: stats.onTimeArrival || 0,
            averageHours: avgHours,
            monthlyTrend: monthlyTrend.length > 0 ? monthlyTrend : [
              { month: 'Sep', attendance: 85 },
              { month: 'Oct', attendance: 88 },
              { month: 'Nov', attendance: attendancePercentage },
            ],
          });

          // Format records for display
          const formattedRecords = records.map(record => {
            const date = new Date(record.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            return {
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
              day: dayName,
              checkIn: record.checkInTime 
                ? new Date(record.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                : '-',
              checkOut: record.checkOutTime 
                ? new Date(record.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                : '-',
              hours: record.workingHours ? record.workingHours.toFixed(1) : '0',
              status: record.status || 'Absent'
            };
          });

          setAttendanceRecords(formattedRecords.reverse()); // Most recent first
        }
      } catch (err) {
        console.error('Error fetching attendance data:', err);
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

  // Filter records by selected month
  const getFilteredRecords = () => {
    const [year, month] = selectedMonth.split('-');
    return attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      const recordYear = recordDate.getFullYear().toString();
      const recordMonth = String(recordDate.getMonth() + 1).padStart(2, '0');
      return recordYear === year && recordMonth === month;
    });
  };

  const filteredRecords = getFilteredRecords();
  const displayRecords = filteredRecords.length > 0 ? filteredRecords : attendanceRecords.slice(0, 8);

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px' }}>Loading attendance...</div>;
  if (!employeeData || !attendanceStats) return <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px' }}>No data available</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return '#10b981';
      case 'Absent':
        return '#ef4444';
      case 'Leave':
        return '#f59e0b';
      case 'Week Off':
        return '#6b7280';
      default:
        return '#667eea';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present':
        return <Check size={16} />;
      case 'Absent':
        return <AlertCircle size={16} />;
      case 'Leave':
        return <Calendar size={16} />;
      default:
        return <Clock size={16} />;
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
        <EmployeeSidebar isSidebarOpen={isSidebarOpen} employeeData={employeeData} activePage="attendance" />
      </aside>

      <main className="employee-main">
        <section className="emp-welcome">
          <div>
            <h2>My Attendance 📅</h2>
            <p>Track your attendance records and statistics</p>
          </div>
        </section>

        <section className="emp-cards-grid">
          <div className="emp-card leave-card">
            <div className="card-icon">
              <TrendingUp size={28} style={{ color: '#10b981' }} />
            </div>
            <div className="card-content">
              <h3>Attendance %</h3>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginTop: '8px' }}>
                {attendanceStats.percentage}%
              </div>
            </div>
          </div>

          <div className="emp-card attendance-card">
            <div className="card-icon">
              <Check size={28} style={{ color: '#3b82f6' }} />
            </div>
            <div className="card-content">
              <h3>Present Days</h3>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', marginTop: '8px' }}>
                {attendanceStats.presentDays}
              </div>
            </div>
          </div>

          <div className="emp-card performance-card">
            <div className="card-icon">
              <Clock size={28} style={{ color: '#f59e0b' }} />
            </div>
            <div className="card-content">
              <h3>Avg Hours/Day</h3>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginTop: '8px' }}>
                {attendanceStats.averageHours}h
              </div>
            </div>
          </div>
        </section>

        <div className="emp-content-grid">
          <section className="emp-section" style={{ gridColumn: '1 / -1' }}>
            <div className="emp-widget">
              <h3 style={{ marginBottom: '20px' }}>Monthly Trend</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '30px' }}>
                {attendanceStats.monthlyTrend.map((item, idx) => (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <div style={{ height: '120px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative', marginBottom: '8px' }}>
                      <div 
                        style={{ 
                          width: '60%', 
                          height: `${item.attendance * 1.2}px`, 
                          background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)', 
                          borderRadius: '4px 4px 0 0' 
                        }} 
                      />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{item.month}</div>
                    <div style={{ fontSize: '12px', color: '#667eea', fontWeight: '700' }}>{item.attendance}%</div>
                  </div>
                ))}
              </div>

              <h3 style={{ marginTop: '40px', marginBottom: '20px' }}>Attendance Records</h3>
              
              {/* Month Filter */}
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>Filter by Month:</label>
                <input 
                  type="month" 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    backgroundColor: 'white'
                  }}
                />
                <span style={{ color: '#6b7280', fontSize: '13px' }}>
                  ({filteredRecords.length} records)
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '13px' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '13px' }}>Day</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '13px' }}>Check In</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '13px' }}>Check Out</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '13px' }}>Hours</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '13px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayRecords.map((record, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? '#f9fafb' : 'white' }}>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#1f2937', fontWeight: '500' }}>{record.date}</td>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>{record.day}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#1f2937', fontWeight: '500' }}>{record.checkIn}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#1f2937', fontWeight: '500' }}>{record.checkOut}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#667eea', fontWeight: '600' }}>{record.hours}h</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '12px', background: `${getStatusColor(record.status)}20`, color: getStatusColor(record.status), fontSize: '12px', fontWeight: '600' }}>
                            {getStatusIcon(record.status)}
                            {record.status}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default EmployeeAttendance;
