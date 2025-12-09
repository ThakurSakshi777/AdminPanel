import { useState, useEffect } from 'react';
import { Download, Printer, Eye, Calendar, DollarSign, FileText } from 'lucide-react';
import { getMySalarySlips, getMyProfile } from '../services/hrService';

const SalarySlip = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'preview'
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [salarySlips, setSalarySlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);

  // Fetch salary slips on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch employee profile
        const profileRes = await getMyProfile();
        if (profileRes.success) {
          setEmployeeData(profileRes.data);
        }

        // Fetch salary slips
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const response = await getMySalarySlips(year, month);

        if (response.success && response.data) {
          // Format data from API
          const slips = Array.isArray(response.data) ? response.data : (response.data.slips || []);
          const formattedSlips = slips.map((slip, idx) => ({
            id: slip._id || idx,
            month: slip.month || `2024-${String(month).padStart(2, '0')}`,
            monthName: slip.monthName || `Month ${month}, 2024`,
            employeeId: slip.employeeId || profileRes.data?.employeeId || 'N/A',
            employeeName: slip.employeeName || profileRes.data?.name || 'Employee',
            department: slip.department || profileRes.data?.department || 'N/A',
            designation: slip.designation || profileRes.data?.position || 'N/A',
            basicSalary: slip.basicSalary || 0,
            dearness: slip.dearness || 0,
            hra: slip.hra || 0,
            conveyance: slip.conveyance || 0,
            medical: slip.medical || 0,
            totalEarnings: slip.totalEarnings || 0,
            pf: slip.pf || 0,
            esi: slip.esi || 0,
            tds: slip.tds || 0,
            totalDeductions: slip.totalDeductions || 0,
            netSalary: slip.netSalary || 0,
            generatedDate: slip.generatedDate ? new Date(slip.generatedDate).toLocaleDateString() : new Date().toLocaleDateString(),
            status: slip.status || 'Pending'
          }));

          setSalarySlips(formattedSlips);
        } else {
          // Fallback if no salary data available
          setSalarySlips([]);
        }
      } catch (err) {
        console.error('Error fetching salary slips:', err);
        setError('Failed to load salary slips');
        setSalarySlips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewSlip = (slip) => {
    setSelectedSlip(slip);
    setViewMode('preview');
  };

  const handleDownload = (slip) => {
    // Placeholder for download functionality
    console.log('Downloading salary slip for', slip.monthName);
    alert(`📥 Downloading salary slip for ${slip.monthName}`);
  };

  const handlePrint = (slip) => {
    // Placeholder for print functionality
    console.log('Printing salary slip for', slip.monthName);
    window.print();
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedSlip(null);
  };

  return (
    <div className="salary-slip-page">
      {viewMode === 'list' ? (
        <>
          <div className="salary-slip-header">
            <h1>💰 Salary Slip</h1>
            <p>View and download your monthly salary slips</p>
          </div>

          <div className="salary-slip-content">
            {/* Filter Section */}
            <div className="salary-slip-filter">
              <div className="filter-group">
                <label>
                  <Calendar size={18} />
                  Select Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="month-picker"
                />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>Loading salary slips...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                background: '#fee', 
                borderRadius: '8px',
                color: '#c33',
                marginBottom: '20px'
              }}>
                <p>{error}</p>
              </div>
            )}

            {/* Salary Slips List */}
            {!loading && (
              <div className="salary-slips-grid">
                {salarySlips.length > 0 ? (
                  salarySlips.map((slip) => (
                <div key={slip.id} className="salary-slip-card">
                  <div className="slip-card-header">
                    <div className="slip-month-info">
                      <h3>{slip.monthName}</h3>
                      <p className="slip-date">Generated: {slip.generatedDate}</p>
                    </div>
                    <span className={`slip-status ${slip.status.toLowerCase()}`}>
                      ✓ {slip.status}
                    </span>
                  </div>

                  <div className="slip-card-body">
                    <div className="slip-info-row">
                      <span className="label">Employee</span>
                      <span className="value">{slip.employeeName}</span>
                    </div>
                    <div className="slip-info-row">
                      <span className="label">Department</span>
                      <span className="value">{slip.department}</span>
                    </div>
                    <div className="slip-info-divider"></div>
                    <div className="slip-salary-summary">
                      <div className="summary-item">
                        <span className="summary-label">Total Earnings</span>
                        <span className="summary-value earnings">₹{slip.totalEarnings.toLocaleString()}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Total Deductions</span>
                        <span className="summary-value deductions">₹{slip.totalDeductions.toLocaleString()}</span>
                      </div>
                      <div className="summary-item highlight">
                        <span className="summary-label">Net Salary</span>
                        <span className="summary-value net">₹{slip.netSalary.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="slip-card-footer">
                    <button 
                      className="btn-view"
                      onClick={() => handleViewSlip(slip)}
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button 
                      className="btn-download"
                      onClick={() => handleDownload(slip)}
                    >
                      <Download size={16} />
                      Download
                    </button>
                    <button 
                      className="btn-print"
                      onClick={() => handlePrint(slip)}
                    >
                      <Printer size={16} />
                      Print
                    </button>
                  </div>
                </div>
              ))
                ) : (
                  <div className="no-data-message">
                    <FileText size={48} />
                    <p>No salary slips available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Salary Slip Preview */}
          <div className="salary-slip-preview">
            <div className="preview-header">
              <button className="btn-back" onClick={handleBackToList}>
                ← Back to List
              </button>
              <div className="preview-actions">
                <button 
                  className="btn-preview-download"
                  onClick={() => handleDownload(selectedSlip)}
                >
                  <Download size={16} />
                  Download
                </button>
                <button 
                  className="btn-preview-print"
                  onClick={() => handlePrint(selectedSlip)}
                >
                  <Printer size={16} />
                  Print
                </button>
              </div>
            </div>

            <div className="slip-preview-document">
              <div className="slip-document">
                {/* Header */}
                <div className="slip-document-header">
                  <div className="company-info">
                    <h2>TechCorp Solutions</h2>
                    <p>Mumbai Office • IT Management</p>
                  </div>
                  <div className="slip-doc-title">
                    <h1>SALARY SLIP</h1>
                    <p>{selectedSlip.monthName}</p>
                  </div>
                </div>

                {/* Employee Details */}
                <div className="slip-document-section">
                  <h3>Employee Information</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="label">Employee ID</span>
                      <span className="value">{selectedSlip.employeeId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Employee Name</span>
                      <span className="value">{selectedSlip.employeeName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Department</span>
                      <span className="value">{selectedSlip.department}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Designation</span>
                      <span className="value">{selectedSlip.designation}</span>
                    </div>
                  </div>
                </div>

                {/* Earnings */}
                <div className="slip-document-section">
                  <h3>Earnings</h3>
                  <table className="slip-table">
                    <tbody>
                      <tr>
                        <td className="label">Basic Salary</td>
                        <td className="value">₹{selectedSlip.basicSalary.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="label">Dearness Allowance</td>
                        <td className="value">₹{selectedSlip.dearness.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="label">HRA (House Rent Allowance)</td>
                        <td className="value">₹{selectedSlip.hra.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="label">Conveyance</td>
                        <td className="value">₹{selectedSlip.conveyance.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="label">Medical Allowance</td>
                        <td className="value">₹{selectedSlip.medical.toLocaleString()}</td>
                      </tr>
                      <tr className="total-row">
                        <td className="label">Total Earnings</td>
                        <td className="value">₹{selectedSlip.totalEarnings.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Deductions */}
                <div className="slip-document-section">
                  <h3>Deductions</h3>
                  <table className="slip-table">
                    <tbody>
                      <tr>
                        <td className="label">Provident Fund (PF)</td>
                        <td className="value">₹{selectedSlip.pf.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="label">ESI (Employee State Insurance)</td>
                        <td className="value">₹{selectedSlip.esi.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="label">Tax Deducted at Source (TDS)</td>
                        <td className="value">₹{selectedSlip.tds.toLocaleString()}</td>
                      </tr>
                      <tr className="total-row">
                        <td className="label">Total Deductions</td>
                        <td className="value">₹{selectedSlip.totalDeductions.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Net Salary */}
                <div className="slip-document-section">
                  <div className="net-salary-box">
                    <span className="label">NET SALARY</span>
                    <span className="amount">₹{selectedSlip.netSalary.toLocaleString()}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="slip-document-footer">
                  <p>This is a computer-generated document and does not require a signature.</p>
                  <p>Generated on: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalarySlip;
