import { useState } from 'react';
import { BarChart3, Download, FileText, Calendar, TrendingUp, Users, Filter, X } from 'lucide-react';

const Reports = () => {
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState({
    startDate: '2025-01-01',
    endDate: '2025-02-28'
  });
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const departments = ['All', 'Development', 'HR', 'Sales', 'Finance', 'Operations'];

  // Sample data for different reports
  const attendanceData = [
    { empID: 'EMP001', name: 'Raj Kumar', dept: 'Development', present: 20, absent: 2, leave: 3, percentage: 83 },
    { empID: 'EMP002', name: 'Priya Singh', dept: 'HR', present: 22, absent: 1, leave: 2, percentage: 92 },
    { empID: 'EMP003', name: 'Amit Patel', dept: 'Development', present: 18, absent: 4, leave: 3, percentage: 75 },
    { empID: 'EMP004', name: 'Neha Sharma', dept: 'Sales', present: 21, absent: 2, leave: 2, percentage: 88 },
    { empID: 'EMP005', name: 'Vikram Singh', dept: 'Development', present: 19, absent: 3, leave: 3, percentage: 79 },
  ];

  const salaryData = [
    { empID: 'EMP001', name: 'Raj Kumar', dept: 'Development', baseSalary: 600000, bonus: 50000, deductions: 20000, net: 630000 },
    { empID: 'EMP002', name: 'Priya Singh', dept: 'HR', baseSalary: 500000, bonus: 40000, deductions: 15000, net: 525000 },
    { empID: 'EMP003', name: 'Amit Patel', dept: 'Development', baseSalary: 550000, bonus: 45000, deductions: 18000, net: 577000 },
    { empID: 'EMP004', name: 'Neha Sharma', dept: 'Sales', baseSalary: 480000, bonus: 60000, deductions: 16000, net: 524000 },
    { empID: 'EMP005', name: 'Vikram Singh', dept: 'Development', baseSalary: 580000, bonus: 48000, deductions: 19000, net: 609000 },
  ];

  const projectData = [
    { projectName: 'CRM System', status: 'In Progress', progress: 65, budget: 500000, spent: 325000, roi: 12.5 },
    { projectName: 'E-commerce Portal', status: 'In Progress', progress: 45, budget: 800000, spent: 360000, roi: 8.3 },
    { projectName: 'Mobile App', status: 'Planning', progress: 20, budget: 600000, spent: 120000, roi: 2.0 },
    { projectName: 'Analytics Dashboard', status: 'Completed', progress: 100, budget: 400000, spent: 410000, roi: 15.8 },
  ];

  const leaveData = [
    { month: 'January', casual: 45, sick: 12, personal: 8, total: 65 },
    { month: 'February', casual: 38, sick: 10, personal: 6, total: 54 },
    { month: 'March', casual: 42, sick: 14, personal: 9, total: 65 },
  ];

  const generateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      let data;
      if (reportType === 'attendance') {
        data = attendanceData;
      } else if (reportType === 'salary') {
        data = salaryData;
      } else if (reportType === 'projects') {
        data = projectData;
      } else {
        data = leaveData;
      }
      
      if (selectedDepartment !== 'All' && data[0]?.dept) {
        data = data.filter(row => row.dept === selectedDepartment);
      }
      
      setReportData(data);
      setIsGenerating(false);
    }, 800);
  };

  const downloadReport = (format) => {
    if (!reportData) return;
    
    let content = '';
    let filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'csv') {
      const headers = Object.keys(reportData[0]).join(',');
      const rows = reportData.map(row => Object.values(row).join(','));
      content = [headers, ...rows].join('\n');
      filename += '.csv';
    } else {
      // PDF-like text format
      content = `${reportType.toUpperCase()} REPORT\n`;
      content += `Generated: ${new Date().toLocaleString()}\n`;
      content += `Date Range: ${dateRange.startDate} to ${dateRange.endDate}\n\n`;
      content += JSON.stringify(reportData, null, 2);
      filename += '.txt';
    }
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getReportTitle = () => {
    const titles = {
      attendance: 'Attendance Report',
      salary: 'Salary Report',
      projects: 'Project Performance Report',
      leaves: 'Leave Analysis Report'
    };
    return titles[reportType] || 'Report';
  };

  const getTotalStats = () => {
    if (!reportData || reportData.length === 0) return null;

    if (reportType === 'attendance') {
      const total = reportData.reduce((sum, row) => sum + row.percentage, 0);
      return `Average Attendance: ${(total / reportData.length).toFixed(1)}%`;
    } else if (reportType === 'salary') {
      const total = reportData.reduce((sum, row) => sum + row.net, 0);
      return `Total Payroll: ₹${total.toLocaleString()}`;
    } else if (reportType === 'projects') {
      const total = reportData.reduce((sum, row) => sum + row.spent, 0);
      return `Total Spent: ₹${total.toLocaleString()}`;
    } else {
      const total = reportData.reduce((sum, row) => sum + row.total, 0);
      return `Total Leaves: ${total} days`;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>Reports & Analytics</h2>
          <p className="subtitle">Generate comprehensive business reports and analytics</p>
        </div>
      </div>

      {/* Report Type Selection */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
          Report Generator
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => { setReportType('attendance'); setReportData(null); }}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: reportType === 'attendance' ? '2px solid #4f46e5' : '2px solid #e5e7eb',
              backgroundColor: reportType === 'attendance' ? '#eef2ff' : 'white',
              cursor: 'pointer',
              fontWeight: '600',
              color: reportType === 'attendance' ? '#4f46e5' : '#666',
              transition: 'all 0.2s'
            }}
          >
            <FileText size={16} style={{ marginRight: '8px', display: 'inline' }} />
            Attendance
          </button>
          <button
            onClick={() => { setReportType('salary'); setReportData(null); }}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: reportType === 'salary' ? '2px solid #4f46e5' : '2px solid #e5e7eb',
              backgroundColor: reportType === 'salary' ? '#eef2ff' : 'white',
              cursor: 'pointer',
              fontWeight: '600',
              color: reportType === 'salary' ? '#4f46e5' : '#666',
              transition: 'all 0.2s'
            }}
          >
            <TrendingUp size={16} style={{ marginRight: '8px', display: 'inline' }} />
            Salary
          </button>
          <button
            onClick={() => { setReportType('projects'); setReportData(null); }}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: reportType === 'projects' ? '2px solid #4f46e5' : '2px solid #e5e7eb',
              backgroundColor: reportType === 'projects' ? '#eef2ff' : 'white',
              cursor: 'pointer',
              fontWeight: '600',
              color: reportType === 'projects' ? '#4f46e5' : '#666',
              transition: 'all 0.2s'
            }}
          >
            <BarChart3 size={16} style={{ marginRight: '8px', display: 'inline' }} />
            Projects
          </button>
          <button
            onClick={() => { setReportType('leaves'); setReportData(null); }}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: reportType === 'leaves' ? '2px solid #4f46e5' : '2px solid #e5e7eb',
              backgroundColor: reportType === 'leaves' ? '#eef2ff' : 'white',
              cursor: 'pointer',
              fontWeight: '600',
              color: reportType === 'leaves' ? '#4f46e5' : '#666',
              transition: 'all 0.2s'
            }}
          >
            <Users size={16} style={{ marginRight: '8px', display: 'inline' }} />
            Leaves
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              <Calendar size={16} /> Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              <Calendar size={16} /> End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              <Filter size={16} /> Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer' }}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <button 
              className="btn-primary-modern"
              onClick={generateReport}
              disabled={isGenerating}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isGenerating ? '⏳ Generating...' : '🔄 Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                {getReportTitle()}
              </h3>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                {getTotalStats()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn-secondary-modern"
                onClick={() => downloadReport('csv')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={16} /> CSV
              </button>
              <button 
                className="btn-secondary-modern"
                onClick={() => downloadReport('pdf')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={16} /> PDF
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {reportData.length > 0 && Object.keys(reportData[0]).map(key => (
                    <th key={key} style={{ textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, colIdx) => (
                      <td key={colIdx} style={{
                        color: typeof val === 'number' && val > 0 && val < 100 ? '#4f46e5' : 'inherit',
                        fontWeight: typeof val === 'number' ? '600' : 'normal'
                      }}>
                        {typeof val === 'number' ? (
                          val > 1000 ? `₹${val.toLocaleString()}` : 
                          val < 100 && col && col.includes('Percentage|percentage|%') ? `${val}%` :
                          val.toFixed(val < 100 ? 1 : 0)
                        ) : val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
              📊 Report generated on {new Date().toLocaleString()}
              {dateRange.startDate && dateRange.endDate && ` • Period: ${dateRange.startDate} to ${dateRange.endDate}`}
              {selectedDepartment !== 'All' && ` • Department: ${selectedDepartment}`}
            </p>
          </div>
        </div>
      )}

      {!reportData && (
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '2px dashed #d1d5db',
          padding: '64px 24px',
          textAlign: 'center',
          color: '#666'
        }}>
          <BarChart3 size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3 style={{ marginBottom: '8px' }}>No Report Generated Yet</h3>
          <p>Select report type and filters, then click "Generate Report" to view data</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
