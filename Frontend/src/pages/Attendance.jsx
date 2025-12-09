import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Clock, Check, X, ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react';
import { getMyAttendance } from '../services/hrService';

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    empID: '',
    name: '',
    date: '',
    checkIn: '',
    checkOut: '',
    status: 'Present',
    workHours: 0
  });

  // Fetch attendance records from API
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const res = await getMyAttendance();
        if (res.success) {
          const records = res.data.records || res.data || [];
          // Format records to match the table structure
          const formattedRecords = records.map((record, idx) => ({
            id: idx + 1,
            empID: record.employeeId || 'N/A',
            name: record.employeeName || 'N/A',
            date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
            checkIn: record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-',
            checkOut: record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-',
            status: record.status || 'Absent',
            workHours: record.workingHours || 0
          }));
          setAttendanceRecords(formattedRecords);
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError('Failed to load attendance records');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        empID: record.empID,
        name: record.name,
        date: record.date,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        status: record.status,
        workHours: record.workHours
      });
    } else {
      setEditingRecord(null);
      setFormData({
        empID: '',
        name: '',
        date: selectedDate,
        checkIn: '',
        checkOut: '',
        status: 'Present',
        workHours: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    
    const [checkInHour, checkInMin] = checkIn.split(':').map(Number);
    const [checkOutHour, checkOutMin] = checkOut.split(':').map(Number);
    
    const checkInTime = checkInHour + checkInMin / 60;
    const checkOutTime = checkOutHour + checkOutMin / 60;
    
    return parseFloat((checkOutTime - checkInTime).toFixed(1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.date) {
      alert('Please fill all required fields');
      return;
    }

    const workHours = formData.status === 'Present' ? calculateWorkHours(formData.checkIn, formData.checkOut) : 0;

    if (editingRecord) {
      setAttendanceRecords(prev => prev.map(rec => 
        rec.id === editingRecord.id 
          ? { ...rec, ...formData, workHours }
          : rec
      ));
    } else {
      const newRecord = {
        id: attendanceRecords.length + 1,
        ...formData,
        workHours
      };
      setAttendanceRecords(prev => [...prev, newRecord]);
    }
    
    handleCloseModal();
  };

  const handleDeleteRecord = (recordId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setAttendanceRecords(prev => prev.filter(rec => rec.id !== recordId));
    }
  };

  const filteredRecords = attendanceRecords.filter(rec =>
    (rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     rec.empID.toLowerCase().includes(searchTerm.toLowerCase())) &&
    rec.date === selectedDate
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'Present': return 'success';
      case 'Absent': return 'danger';
      case 'Leave': return 'warning';
      default: return 'secondary';
    }
  };

  const getTodayStats = () => {
    const todayRecords = attendanceRecords.filter(r => r.date === selectedDate);
    return {
      total: todayRecords.length,
      present: todayRecords.filter(r => r.status === 'Present').length,
      absent: todayRecords.filter(r => r.status === 'Absent').length,
      leave: todayRecords.filter(r => r.status === 'Leave').length,
      avgWorkHours: (todayRecords.reduce((sum, r) => sum + r.workHours, 0) / todayRecords.filter(r => r.status === 'Present').length).toFixed(1)
    };
  };

  const stats = getTodayStats();

  // Show loading state
  if (loading) {
    return (
      <div className="page-container">
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading attendance records...
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="page-container">
        <div style={{ padding: '40px', textAlign: 'center', color: '#d32f2f' }}>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>Attendance Management</h2>
          <p className="subtitle">Track employee daily attendance and work hours</p>
        </div>
        <button className="btn-primary-modern" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Mark Attendance
        </button>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label htmlFor="dateFilter" style={{ fontWeight: '600' }}>Select Date:</label>
        <input
          type="date"
          id="dateFilter"
          value={selectedDate}
          onChange={(e) => {setSelectedDate(e.target.value); setCurrentPage(1);}}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e3f2fd' }}>
            <User size={24} />
          </div>
          <div className="stat-content">
            <h4>Total Employees</h4>
            <p className="stat-number">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e8f5e9' }}>
            <Check size={24} />
          </div>
          <div className="stat-content">
            <h4>Present</h4>
            <p className="stat-number">{stats.present}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ffebee' }}>
            <X size={24} />
          </div>
          <div className="stat-content">
            <h4>Absent</h4>
            <p className="stat-number">{stats.absent}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fff3e0' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h4>Avg Work Hours</h4>
            <p className="stat-number">{stats.avgWorkHours}h</p>
          </div>
        </div>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input 
          type="text" 
          placeholder="Search by employee name or ID..." 
          value={searchTerm}
          onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Work Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                  No attendance records found
                </td>
              </tr>
            ) : (
              currentRecords.map((rec) => (
                <tr key={rec.id}>
                  <td><strong>{rec.empID}</strong></td>
                  <td>{rec.name}</td>
                  <td>{rec.checkIn || '-'}</td>
                  <td>{rec.checkOut || '-'}</td>
                  <td>{rec.workHours}h</td>
                  <td>
                    <span className={`badge-status ${getStatusBadgeColor(rec.status)}`}>
                      {rec.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => handleOpenModal(rec)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon danger" onClick={() => handleDeleteRecord(rec.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredRecords.length > itemsPerPage && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          
          <div className="pagination-numbers">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button 
            className="pagination-btn"
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      <div className="pagination-info">
        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRecords.length)} of {filteredRecords.length} records
      </div>

      {/* Mark Attendance Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingRecord ? 'Edit Attendance' : 'Mark Attendance'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="empID">Employee ID *</label>
                  <input
                    type="text"
                    id="empID"
                    name="empID"
                    value={formData.empID}
                    onChange={handleInputChange}
                    placeholder="e.g., EMP001"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="name">Employee Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter employee name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="date">Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="checkIn">Check-In Time</label>
                  <input
                    type="time"
                    id="checkIn"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleInputChange}
                    disabled={formData.status !== 'Present'}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="checkOut">Check-Out Time</label>
                  <input
                    type="time"
                    id="checkOut"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleInputChange}
                    disabled={formData.status !== 'Present'}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingRecord ? 'Update Attendance' : 'Mark Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
