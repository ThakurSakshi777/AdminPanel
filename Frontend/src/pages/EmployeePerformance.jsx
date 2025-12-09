import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Star, TrendingUp, Award } from 'lucide-react';
import { getMyProfile, getMyPerformance } from '../services/hrService';
import EmployeeSidebar from '../components/EmployeeSidebar';

const EmployeePerformance = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [expandedReview, setExpandedReview] = useState(null);

  const calculatePerformanceRating = (perfData) => {
    if (!perfData) return { rating: 0, label: 'Not Rated' };
    const performance = parseFloat(perfData.performance) || 0;
    const rating = Math.round(performance / 20 * 10) / 10;
    const labels = {
      5: 'Excellent',
      4: 'Very Good',
      3: 'Good',
      2: 'Average',
      1: 'Below Average',
      0: 'Not Rated'
    };
    return { rating: Math.min(rating, 5), label: labels[Math.floor(rating)] || 'Not Rated' };
  };

  useEffect(() => {
    const fetchData = async () => {
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
          // Set default employee data if profile fetch fails
          setEmployeeData({
            name: 'Employee',
            avatar: 'E',
            jobTitle: 'Employee',
            department: 'N/A',
          });
        }

        const perfRes = await getMyPerformance();
        console.log('Performance Response:', perfRes);
        if (perfRes.success) {
          const data = perfRes.data || {};
          const perfData = Array.isArray(data) ? data[0] : data;
          const { rating, label } = calculatePerformanceRating(perfData);
          
          setPerformanceMetrics({
            overallRating: rating,
            ratingLabel: label,
            performance: parseFloat(perfData.performance) || 0,
            attendance: parseFloat(perfData.attendance) || 0,
            productivity: parseFloat(perfData.productivity) || 0,
            taskCompletion: parseFloat(perfData.tasksCompletionRate) || 0,
            teamwork: parseFloat(perfData.teamwork) || 0,
            communication: parseFloat(perfData.communication) || 0,
            feedback: perfData.feedback || '',
            strengths: perfData.strengths || [],
            areasForImprovement: perfData.improvements || [],
            achievements: perfData.achievements || [],
            skills: perfData.skills || [],
            reviews: Array.isArray(perfData.reviews) ? perfData.reviews : [],
          });
        } else {
          setPerformanceMetrics({
            overallRating: 0,
            ratingLabel: 'Not Rated',
            performance: 0,
            attendance: 0,
            productivity: 0,
            taskCompletion: 0,
            teamwork: 0,
            communication: 0,
            reviews: [],
          });
        }
      } catch (err) {
        console.error('Error fetching performance data:', err);
        setError('Failed to load performance data');
        setEmployeeData({
          name: 'Employee',
          avatar: 'E',
          jobTitle: 'Employee',
          department: 'N/A',
        });
        setPerformanceMetrics({
          overallRating: 0,
          ratingLabel: 'Error',
          attendance: 0,
          productivity: 0,
          taskCompletion: 0,
          teamwork: 0,
          communication: 0,
          reviews: [],
        });
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

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading performance data...</div>;

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
        <EmployeeSidebar isSidebarOpen={isSidebarOpen} employeeData={employeeData} activePage="performance" />
      </aside>

      <main className="employee-main">
        <section className="emp-welcome">
          <div>
            <h2>My Performance Rating ⭐</h2>
            <p>Track your performance metrics and reviews</p>
          </div>
        </section>

        {error && <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px' }}>⚠️ {error}</div>}

        <section className="emp-cards-grid">
          <div className="emp-card leave-card">
            <div className="card-icon">
              <Star size={28} style={{ color: '#f59e0b' }} />
            </div>
            <div className="card-content">
              <h3>Overall Rating</h3>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginTop: '8px' }}>
                {performanceMetrics.overallRating}/5.0
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{performanceMetrics.ratingLabel}</div>
            </div>
          </div>

          <div className="emp-card attendance-card">
            <div className="card-icon">
              <TrendingUp size={28} style={{ color: '#10b981' }} />
            </div>
            <div className="card-content">
              <h3>Productivity</h3>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginTop: '8px' }}>
                {Math.round(performanceMetrics.productivity * 10) / 10}%
              </div>
            </div>
          </div>

          <div className="emp-card performance-card">
            <div className="card-icon">
              <Star size={28} style={{ color: '#3b82f6' }} />
            </div>
            <div className="card-content">
              <h3>Task Completion</h3>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', marginTop: '8px' }}>
                {Math.round(performanceMetrics.taskCompletion * 10) / 10}%
              </div>
            </div>
          </div>
        </section>

        <div className="emp-content-grid">
          <section className="emp-section" style={{ gridColumn: '1 / -1' }}>
            <div className="emp-widget">
              <h3 style={{ marginBottom: '20px' }}>⭐ Performance Metrics</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '24px', color: 'white', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', fontWeight: '700', marginBottom: '8px' }}>
                    {performanceMetrics.overallRating}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>/ 5.0 Overall Rating</div>
                  <div style={{ marginTop: '12px', fontSize: '24px' }}>⭐⭐⭐⭐⭐</div>
                </div>

                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Attendance</div>
                    <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${performanceMetrics.attendance}%`, background: '#10b981', transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '12px', color: '#667eea', fontWeight: '700', marginTop: '4px' }}>{performanceMetrics.attendance}%</div>
                  </div>
                </div>
              </div>

              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>Detailed Metrics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                {[
                  { label: 'Attendance', value: Math.round(performanceMetrics.attendance * 10) / 10, color: '#10b981' },
                  { label: 'Productivity', value: Math.round(performanceMetrics.productivity * 10) / 10, color: '#3b82f6' },
                  { label: 'Teamwork', value: Math.round(performanceMetrics.teamwork * 10) / 10, color: '#f59e0b' },
                  { label: 'Communication', value: Math.round(performanceMetrics.communication * 10) / 10, color: '#ef4444' },
                ].map((metric, idx) => (
                  <div key={idx} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '12px' }}>{metric.label}</div>
                    <div style={{ height: '120px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative', marginBottom: '12px' }}>
                      <div style={{ width: '60%', height: `${metric.value * 1.2}px`, background: metric.color, borderRadius: '4px 4px 0 0' }} />
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: metric.color, textAlign: 'center' }}>{metric.value}%</div>
                  </div>
                ))}
              </div>

              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>Performance Reviews</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {performanceMetrics.reviews && performanceMetrics.reviews.length > 0 ? (
                  performanceMetrics.reviews.map((review, idx) => (
                    <div key={idx} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                      <div 
                        onClick={() => setExpandedReview(expandedReview === idx ? null : idx)}
                        style={{
                          padding: '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderLeft: `4px solid #f59e0b`,
                          backgroundColor: expandedReview === idx ? '#fef3c7' : 'white'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>
                            {review.quarter || review.period || 'Performance Review'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                            {'⭐'.repeat(Math.min(Math.floor(review.rating || 0), 5))}
                          </div>
                        </div>
                        <div style={{ fontSize: '20px' }}>{expandedReview === idx ? '▼' : '▶'}</div>
                      </div>
                      {expandedReview === idx && (
                        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', backgroundColor: '#fafafa' }}>
                          {review.rating && (
                            <div style={{ fontSize: '13px', color: '#f59e0b', fontWeight: '600', marginBottom: '12px' }}>
                              Rating: {review.rating}/5.0 {review.reviewedBy && `- by ${review.reviewedBy}`}
                            </div>
                          )}
                          {review.feedback && (
                            <div style={{ marginBottom: '12px' }}>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Feedback:</div>
                              <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>{review.feedback}</div>
                            </div>
                          )}
                          {review.strengths && review.strengths.length > 0 && (
                            <div style={{ marginBottom: '12px' }}>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#10b981', marginBottom: '4px' }}>Strengths:</div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>{Array.isArray(review.strengths) ? review.strengths.join(', ') : review.strengths}</div>
                            </div>
                          )}
                          {review.areasForImprovement && review.areasForImprovement.length > 0 && (
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444', marginBottom: '4px' }}>Areas for Improvement:</div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>{Array.isArray(review.areasForImprovement) ? review.areasForImprovement.join(', ') : review.areasForImprovement}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ background: '#f3f4f6', border: '1px dashed #d1d5db', borderRadius: '8px', padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                    No performance reviews yet. Check back after your reviews are completed.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default EmployeePerformance;
