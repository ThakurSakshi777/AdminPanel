import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, FileText, Upload, Download, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { getMyProfile } from '../services/hrService';
import EmployeeSidebar from '../components/EmployeeSidebar';

const EmployeeDocuments = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [uploadForms, setUploadForms] = useState({});

  // Initialize upload forms for each document type
  useEffect(() => {
    const forms = {};
    Object.entries(documentCategories).forEach(([category, types]) => {
      types.forEach(type => {
        forms[type] = {
          documentName: '',
          selectedFile: null,
          remarks: '',
          uploading: false
        };
      });
    });
    setUploadForms(forms);
  }, []);

  // Use relative path to go through Vite proxy
  const API_BASE_URL = '/api';

  const documentCategories = {
    'Education': ['10th Marksheet', '12th Marksheet', 'Graduation Marksheet', 'Post Graduation Marksheet'],
    'Government ID': ['Aadhar Card', 'PAN Card', 'Passport', 'Driving License'],
    'Personal': ['Professional Picture'],
    'Professional': ['Resume', 'Certificate'],
    'salary-slip': ['salary-slip']
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token || ''}`
    };
  };

  useEffect(() => {
    fetchEmployeeData();
    fetchDocuments();
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

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/documents/my`, {
        method: 'GET',
        headers: getAuthHeader()
      });

      const data = await response.json();
      if (response.ok) {
        setDocuments(data.data || []);
      } else {
        setError(data.message || 'Failed to load documents');
        setDocuments([]);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Error loading documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const handleFileSelect = (documentType, file) => {
    setUploadForms(prev => ({
      ...prev,
      [documentType]: {
        ...prev[documentType],
        selectedFile: file
      }
    }));
  };

  const handleFormChange = (documentType, field, value) => {
    setUploadForms(prev => ({
      ...prev,
      [documentType]: {
        ...prev[documentType],
        [field]: value
      }
    }));
  };

  const handleUpload = async (documentType) => {
    const form = uploadForms[documentType];
    
    if (!form?.selectedFile) {
      setError(`Please select a file for ${documentType}`);
      return;
    }

    try {
      setUploadForms(prev => ({
        ...prev,
        [documentType]: { ...prev[documentType], uploading: true }
      }));
      setError('');
      setSuccess('');

      const uploadFormData = new FormData();
      uploadFormData.append('documentType', documentType);
      uploadFormData.append('documentName', form.documentName || form.selectedFile.name);
      uploadFormData.append('document', form.selectedFile);
      uploadFormData.append('remarks', form.remarks || '');

      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: uploadFormData
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(`${documentType} uploaded successfully`);
        // Reset form for this document type
        setUploadForms(prev => ({
          ...prev,
          [documentType]: {
            documentName: '',
            selectedFile: null,
            remarks: '',
            uploading: false
          }
        }));
        setTimeout(() => {
          fetchDocuments();
          setSuccess('');
        }, 1000);
      } else {
        setError(data.message || 'Failed to upload document');
        console.error('Upload Error:', data);
        setUploadForms(prev => ({
          ...prev,
          [documentType]: { ...prev[documentType], uploading: false }
        }));
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(err.message || 'Error uploading document');
      setUploadForms(prev => ({
        ...prev,
        [documentType]: { ...prev[documentType], uploading: false }
      }));
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      setError('');
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (response.ok) {
        setSuccess('Document deleted successfully');
        setTimeout(() => {
          fetchDocuments();
          setSuccess('');
        }, 1000);
      } else {
        setError('Failed to delete document');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Error deleting document');
    }
  };

  const handleDownloadDocument = (documentId, fileName) => {
    const downloadUrl = `${API_BASE_URL}/documents/${documentId}/download`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName || 'document';
    a.click();
  };

  const documentStats = {
    total: documents.length,
    education: documents.filter(d => ['10th Marksheet', '12th Marksheet', 'Graduation Marksheet', 'Post Graduation Marksheet'].includes(d.documentType)).length,
    govtId: documents.filter(d => ['Aadhar Card', 'PAN Card', 'Passport', 'Driving License'].includes(d.documentType)).length
  };

  const groupedDocuments = Object.entries(documentCategories).reduce((acc, [category, types]) => {
    acc[category] = documents.filter(d => types.includes(d.documentType));
    return acc;
  }, {});

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading documents...</div>;

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
        <EmployeeSidebar isSidebarOpen={isSidebarOpen} employeeData={employeeData} activePage="documents" />
      </aside>

      <main className="employee-main">
        <section className="emp-welcome">
          <div>
            <h2>My Documents 📄</h2>
            <p>Upload, view, and manage your official documents</p>
          </div>
        </section>

        {error && <div style={{ padding: '15px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px', margin: '0 20px 20px 20px' }}>⚠️ {error}</div>}
        {success && <div style={{ padding: '15px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '20px', margin: '0 20px 20px 20px' }}>✓ {success}</div>}

        <section className="emp-cards-grid">
          <div className="emp-card leave-card">
            <div className="card-icon">
              <FileText size={28} style={{ color: '#f59e0b' }} />
            </div>
            <div className="card-content">
              <h3>Total Documents</h3>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginTop: '8px' }}>
                {documentStats.total}
              </div>
            </div>
          </div>

          <div className="emp-card attendance-card">
            <div className="card-icon">
              <FileText size={28} style={{ color: '#3b82f6' }} />
            </div>
            <div className="card-content">
              <h3>Education</h3>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', marginTop: '8px' }}>
                {documentStats.education}
              </div>
            </div>
          </div>

          <div className="emp-card performance-card">
            <div className="card-icon">
              <FileText size={28} style={{ color: '#10b981' }} />
            </div>
            <div className="card-content">
              <h3>Government ID</h3>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginTop: '8px' }}>
                {documentStats.govtId}
              </div>
            </div>
          </div>
        </section>

        <div className="emp-content-grid">
          {/* Upload Documents Section */}
          <section className="emp-section" style={{ gridColumn: '1 / -1' }}>
            <div className="emp-widget">
              <h3 style={{ marginBottom: '8px', fontSize: '18px', fontWeight: '700' }}>📤 Upload Documents</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>Small boxes for each required document. Upload individually, per box.</p>

              {/* Render upload boxes by category */}
              {Object.entries(documentCategories).map(([category, types]) => (
                <div key={category} style={{ marginBottom: '32px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#1f2937' }}>{category}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
                    {types.map(type => {
                      const form = uploadForms[type] || {};
                      const uploadedDoc = documents.find(d => d.documentType === type);
                      
                      return (
                        <div 
                          key={type}
                          style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '16px',
                            background: uploadedDoc ? '#f0fdf4' : '#ffffff',
                            position: 'relative'
                          }}
                        >
                          <h5 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
                            {type}
                            {uploadedDoc && <span style={{ marginLeft: '8px', fontSize: '12px', color: '#10b981' }}>✓ Uploaded</span>}
                          </h5>

                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Document name (optional)</label>
                            <input 
                              type="text"
                              value={form.documentName || ''}
                              onChange={(e) => handleFormChange(type, 'documentName', e.target.value)}
                              placeholder={`e.g., ${type}`}
                              disabled={form.uploading}
                              style={{ 
                                width: '100%', 
                                padding: '8px', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '6px', 
                                fontSize: '13px',
                                backgroundColor: form.uploading ? '#f3f4f6' : '#ffffff'
                              }}
                            />
                          </div>

                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Select file *</label>
                            <input 
                              type="file"
                              onChange={(e) => handleFileSelect(type, e.target.files[0])}
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                              disabled={form.uploading}
                              style={{ 
                                width: '100%', 
                                fontSize: '12px',
                                padding: '6px'
                              }}
                            />
                            {form.selectedFile && (
                              <span style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', display: 'block' }}>✓ {form.selectedFile.name}</span>
                            )}
                          </div>

                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Remarks</label>
                            <textarea 
                              value={form.remarks || ''}
                              onChange={(e) => handleFormChange(type, 'remarks', e.target.value)}
                              placeholder="Any notes for this document"
                              rows="2"
                              disabled={form.uploading}
                              style={{ 
                                width: '100%', 
                                padding: '8px', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '6px', 
                                fontSize: '12px', 
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                backgroundColor: form.uploading ? '#f3f4f6' : '#ffffff'
                              }}
                            />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>Required: file</span>
                            <button 
                              onClick={() => handleUpload(type)}
                              disabled={form.uploading || !form.selectedFile}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                background: form.uploading || !form.selectedFile ? '#9ca3af' : '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: form.uploading || !form.selectedFile ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s'
                              }}
                              onMouseEnter={(e) => { 
                                if (!form.uploading && form.selectedFile) e.target.style.background = '#5568d3'; 
                              }}
                              onMouseLeave={(e) => { 
                                if (!form.uploading && form.selectedFile) e.target.style.background = '#667eea'; 
                              }}
                            >
                              <Upload size={14} />
                              {form.uploading ? 'Uploading...' : 'Upload'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Documents by Category */}
          {/* {Object.entries(groupedDocuments).map(([category, docs]) => (
            <section key={category} className="emp-section" style={{ gridColumn: '1 / -1' }}>
              <div className="emp-widget">
                <div 
                  onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '12px 0',
                    borderBottom: '1px solid #e5e7eb'
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                    {category} ({docs.length})
                  </h3>
                  {expandedCategory === category ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>

                {expandedCategory === category && (
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {docs.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', background: '#f9fafb', borderRadius: '8px' }}>
                        No documents in this category
                      </div>
                    ) : (
                      docs.map(doc => (
                        <div 
                          key={doc._id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px',
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                              {doc.documentName || doc.documentType}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {doc.documentType} • Uploaded: {new Date(doc.createdAt).toLocaleDateString('en-IN')}
                            </div>
                            {doc.remarks && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Remarks: {doc.remarks}</div>}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                            <button 
                              onClick={() => handleDownloadDocument(doc._id, doc.documentName)}
                              style={{
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                transition: 'all 0.3s'
                              }}
                              onMouseEnter={(e) => e.target.style.background = '#059669'}
                              onMouseLeave={(e) => e.target.style.background = '#10b981'}
                            >
                              <Download size={14} />
                              Download
                            </button>
                            <button 
                              onClick={() => handleDeleteDocument(doc._id)}
                              style={{
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                transition: 'all 0.3s'
                              }}
                              onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                              onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </section>
          ))} */}
        </div>
      </main>
    </div>
  );
};

export default EmployeeDocuments;
