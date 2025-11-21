import { Users, Building2, Mail, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDateRange } from '../context/DateContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { dateRange } = useDateRange();
  const navigate = useNavigate();
  const [filteredData, setFilteredData] = useState({
    stats: {},
    chartData: [],
    activities: []
  });

  // Simulate data filtering based on date range
  useEffect(() => {
    console.log('Date Range Changed:', {
      start: dateRange.startDate,
      end: dateRange.endDate,
      label: dateRange.label
    });
    
    // Here you would fetch filtered data from API
    // For now, we'll just log it
    // fetchDashboardData(dateRange.startDate, dateRange.endDate);
  }, [dateRange]);
  const chartData = [
    { name: '18 Oct', income: 4200, expense: -2100 },
    { name: '21 Oct', income: 5800, expense: -3200 },
    { name: '24 Oct', income: 4500, expense: -2800 },
    { name: '27 Oct', income: 3200, expense: -1900 },
    { name: '30 Oct', income: 4800, expense: -2400 },
    { name: '2 Nov', income: 6200, expense: -3600 },
    { name: '5 Nov', income: 7100, expense: -3100 },
    { name: '8 Nov', income: 5900, expense: -2700 },
    { name: '11 Nov', income: 4600, expense: -2200 },
    { name: '14 Nov', income: 5400, expense: -2900 },
    { name: '17 Nov', income: 6800, expense: -3400 },
    { name: '20 Nov', income: 7400, expense: -2600 },
  ];

  const recentActivities = [
    { id: 1, name: 'Rahul Sharma', action: 'Property Purchase', amount: '₹ 85,00,000', date: 'Oct 18, 2024', status: 'Success', type: 'income' },
    { id: 2, name: 'Priya Patel', action: 'Service Payment', amount: '- ₹ 25,000', date: 'May 24, 2024', status: 'Pending', type: 'expense' },
    { id: 3, name: 'Amit Kumar', action: 'Property Inquiry', amount: '₹ 1,20,00,000', date: 'Nov 20, 2024', status: 'Success', type: 'income' },
    { id: 4, name: 'Sneha Desai', action: 'Maintenance Fee', amount: '- ₹ 15,000', date: 'Nov 19, 2024', status: 'Success', type: 'expense' },
  ];

  // Navigate to cards page
  const handleSeeAllCards = () => {
    navigate('/properties'); // You can create a separate /cards route
  };

  return (
    <div className="dashboard">
      {/* Balance Card */}
      <div className="balance-card">
        <div className="balance-info">
          <p className="balance-label">Total Revenue</p>
          <h1 className="balance-amount">₹ 8,45,67,820</h1>
          <span className="balance-change positive">+15.8% ↑</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Chart Section */}
        <div className="chart-section">
          <div className="section-header">
            <h3>📊 Cash Flow</h3>
            <div className="chart-controls">
              <button className="tab-btn active">Weekly</button>
              <button className="tab-btn">Daily</button>
              <button className="chart-manage">⚙ Manage</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Bar dataKey="income" fill="#0d9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Income/Expense Stats */}
        <div className="income-expense-cards">
          <div className="ie-card income-card">
            <div className="ie-icon">↓</div>
            <div className="ie-info">
              <p className="ie-label">Income</p>
              <h3 className="ie-amount">₹ 12,37,820</h3>
              <span className="ie-change positive">+45.0% ↑</span>
            </div>
          </div>
          <div className="ie-card expense-card">
            <div className="ie-icon">↑</div>
            <div className="ie-info">
              <p className="ie-label">Expense</p>
              <h3 className="ie-amount">₹ 5,78,821</h3>
              <span className="ie-change negative">-12.5% ↓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="account-cards">
        <div className="acc-card">
          <div className="acc-icon">🏢</div>
          <div className="acc-info">
            <p className="acc-label">Business Account <span className="acc-period">Last 30 days</span></p>
            <h3 className="acc-amount">₹ 8,67,220</h3>
            <span className="acc-change positive">+18.0% ↑</span>
            <p className="acc-compare">vs. 7,020.14 Last Period</p>
          </div>
        </div>
        <div className="acc-card">
          <div className="acc-icon">🏦</div>
          <div className="acc-info">
            <p className="acc-label">Total Saving <span className="acc-period">Last 30 days</span></p>
            <h3 className="acc-amount">₹ 3,76,535</h3>
            <span className="acc-change negative">-8.2% ↓</span>
            <p className="acc-compare">vs. 4,116.50 Last Period</p>
          </div>
        </div>
        <div className="acc-card">
          <div className="acc-icon">📊</div>
          <div className="acc-info">
            <p className="acc-label">Tax Reserve <span className="acc-period">Last 30 days</span></p>
            <h3 className="acc-amount">₹ 14,37,616</h3>
            <span className="acc-change positive">+36.2% ↑</span>
            <p className="acc-compare">vs. 10,236.46 Last Period</p>
          </div>
        </div>
      </div>

      {/* Recent Activity & Featured Property */}
      <div className="bottom-grid">
        <div className="recent-activity-modern">
          <div className="section-header">
            <h3>⚡ Recent Activity</h3>
          </div>
          <table className="activity-table">
            <thead>
              <tr>
                <th>TYPE</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>METHOD</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((activity) => (
                <tr key={activity.id}>
                  <td>
                    <div className="activity-type">
                      <span className={`type-icon ${activity.type}`}>{activity.type === 'income' ? '+' : '-'}</span>
                      <div>
                        <p className="type-name">{activity.name}</p>
                        <p className="type-action">{activity.action} • {activity.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="amount-col">{activity.amount}<br/><span className="currency">INR-USD</span></td>
                  <td><span className={`status-badge ${activity.status.toLowerCase()}`}>{activity.status}</span></td>
                  <td className="method-col">Credit Card<br/><span className="card-num">•••• 3540</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Featured Property Card */}
        <div className="featured-card-section">
          <div className="section-header">
            <h3>💳 My Cards</h3>
            <button onClick={handleSeeAllCards} className="see-all" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>See All →</button>
          </div>
          <div className="property-card-modern">
            <div className="card-header-info">
              <span className="card-type">PROPERTY</span>
              <span className="card-number">•••• •••• •••• 2104</span>
            </div>
            <div className="card-balance">
              <h2>₹ 4,54,020</h2>
              <p className="card-location">Premium Villa • Mumbai</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
