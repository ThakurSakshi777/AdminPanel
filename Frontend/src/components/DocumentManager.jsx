import { useState, useEffect } from 'react';
import { Upload, Download, Trash2 } from 'lucide-react';
import '../styles/DocumentManager.css';

function DocumentManager({ employeeId, isHRView }) {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expandedType, setExpandedType] = useState(null);
  const [formData, setFormData] = useState({
    documentType: '',
    documentName: '',
    file: null,
    remarks: ''
  });

  const documentTypes = [
    { value: '10th Marksheet', label: '10th Marksheet', category: 'Education' },
    { value: '12th Marksheet', label: '12th Marksheet', category: 'Education' },
    { value: 'Graduation Marksheet', label: 'Graduation Marksheet', category: 'Education' },
    { value: 'Post Graduation Marksheet', label: 'Post Graduation Marksheet', category: 'Education' },
    { value: 'Aadhar Card', label: 'Aadhar Card', category: 'Government ID' },
    { value: 'PAN Card', label: 'PAN Card', category: 'Government ID' },
    { value: 'Passport', label: 'Passport', category: 'Government ID' },
    { value: 'Driving License', label: 'Driving License', category: 'Government ID' },
    { value: 'Photo', label: 'Photo', category: 'Personal' },
    { value: 'Resume', label: 'Resume', category: 'Professional' },
    { value: 'Certificate', label: 'Certificate', category: 'Professional' },
    { value: 'Other', label: 'Other', category: 'Other' }
  ];

  const API_BASE_URL = '/api';

  const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    console.log('Auth Info - Role:', userRole, 'Has token:', !!token);
    return {
      'Authorization': `Bearer ${token || ''}`
    };
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const userRole = localStorage.getItem('userRole');
      console.log('📄 Fetching documents...');
      console.log('Current user role:', userRole);
      console.log('isHRView:', isHRView);
      console.log('Viewing employeeId:', employeeId);
      
      // Determine which endpoint to use
      let url;
      if (isHRView && userRole === 'hr') {
        // HR viewing all employees documents
        url = `${API_BASE_URL}/documents`;
        console.log('🔍 HR viewing all employees documents using:', url);
      } else if (employeeId && userRole === 'hr') {
        // HR viewing specific employee documents - use employeeId filter
        url = `${API_BASE_URL}/documents?employeeId=${employeeId}`;
        console.log('🔍 HR viewing employee documents using:', url);
      } else {
        // Employee viewing own documents - use /my endpoint
        url = `${API_BASE_URL}/documents/my`;
        console.log('🔍 Viewing own documents using:', url);
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeader()
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setDocuments(data.data || []);
        console.log('✅ Documents fetched successfully:', data.data?.length || 0, 'documents');
      } else {
        console.error('❌ Failed to fetch documents - Status:', response.status);
        console.error('Error response:', data);
        setError(data.message || 'Failed to load documents');
      }
    } catch (err) {
      console.error('❌ Error fetching documents:', err);
      setError('Error loading documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, isHRView]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      // Check file type (only PDF, JPG, PNG, DOC, DOCX)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF, JPG, PNG, DOC, DOCX files are allowed');
        return;
      }
      setFormData(prev => ({ ...prev, file }));
      setError(null);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.documentType || !formData.documentName || !formData.file) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formDataToSend = new FormData();
      formDataToSend.append('documentType', formData.documentType);
      formDataToSend.append('documentName', formData.documentName);
      formDataToSend.append('remarks', formData.remarks);
      formDataToSend.append('document', formData.file);
      
      // If HR is uploading for an employee, include the employeeId
      const userRole = localStorage.getItem('userRole');
      if (employeeId && userRole === 'hr') {
        formDataToSend.append('uploadForEmployeeId', employeeId);
        console.log('HR uploading for employee:', employeeId);
      }

      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Document uploaded successfully!');
        setFormData({ documentType: '', documentName: '', file: null, remarks: '' });
        document.getElementById('file-input') && (document.getElementById('file-input').value = '');
        
        // Refresh documents list
        await fetchDocuments();
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to upload document');
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Error uploading document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/documents/${docId}`, {
          method: 'DELETE',
          headers: getAuthHeader()
        });

        if (response.ok) {
          setSuccess('Document deleted successfully!');
          await fetchDocuments();
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError('Failed to delete document');
        }
      } catch (err) {
        console.error('Error deleting document:', err);
        setError('Error deleting document');
      }
    }
  };

  const handleApprove = async (docId) => {
    if (window.confirm('Are you sure you want to approve this document?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/documents/${docId}/approve`, {
          method: 'PUT',
          headers: getAuthHeader(),
          body: JSON.stringify({ status: 'Approved' })
        });

        if (response.ok) {
          setSuccess('Document approved successfully!');
          await fetchDocuments();
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError('Failed to approve document');
        }
      } catch (err) {
        console.error('Error approving document:', err);
        setError('Error approving document');
      }
    }
  };

  const handleReject = async (docId) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason !== null) {
      try {
        const response = await fetch(`${API_BASE_URL}/documents/${docId}/reject`, {
          method: 'PUT',
          headers: getAuthHeader(),
          body: JSON.stringify({ status: 'Rejected', rejectionReason: reason })
        });

        if (response.ok) {
          setSuccess('Document rejected successfully!');
          await fetchDocuments();
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError('Failed to reject document');
        }
      } catch (err) {
        console.error('Error rejecting document:', err);
        setError('Error rejecting document');
      }
    }
  };

  const handleDownload = (docId, fileName) => {
    try {
      console.log('📥 Downloading document:', docId, fileName);
      const downloadUrl = `${API_BASE_URL}/documents/${docId}/download`;
      console.log('Download URL:', downloadUrl);
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || 'document';
      
      // Add authorization header by using fetch with blob
      fetch(downloadUrl, {
        method: 'GET',
        headers: getAuthHeader()
      })
        .then(response => {
          if (!response.ok) throw new Error('Download failed');
          return response.blob();
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName || 'document';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          console.log('✅ Download complete');
        })
        .catch(err => {
          console.error('❌ Download error:', err);
          setError('Failed to download document');
        });
    } catch (err) {
      console.error('Error initiating download:', err);
      setError('Error downloading document');
    }
  };

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.documentType]) {
      acc[doc.documentType] = [];
    }
    acc[doc.documentType].push(doc);
    return acc;
  }, {});

  return (
    <div className="document-manager-wrapper">
      <div className="document-manager">
        {/* Upload Section - Show only when appropriate */}
        <div className="upload-section">
          <h3 className="section-heading">
            📄 {(() => {
              const userRole = localStorage.getItem('userRole');
              return userRole === 'hr' && employeeId ? 'Upload Document for Employee' : 'Upload Documents';
            })()}
          </h3>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span>{success}</span>
              <button onClick={() => setSuccess(null)}>×</button>
            </div>
          )}

          {/* Form visible only when employeeId is null (employee's own dashboard) */}
          {employeeId === null && (
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-row">
              <div className="form-group">
                <label>Document Type *</label>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleFormChange}
                  required
                  className="form-input"
                >
                  <option value="">Select Document Type</option>
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} ({type.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Document Name *</label>
                <input
                  type="text"
                  name="documentName"
                  value={formData.documentName}
                  onChange={handleFormChange}
                  placeholder="e.g., 10th Standard Marksheet"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Upload File * (PDF, JPG, PNG, DOC - Max 5MB)</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="file-input"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="file-input"
                  />
                  <label htmlFor="file-input" className="file-label">
                    <Upload size={20} />
                    <span>{formData.file ? formData.file.name : 'Click to upload or drag and drop'}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Remarks (Optional)</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleFormChange}
                  placeholder="Add any additional notes or remarks about this document"
                  className="form-input textarea"
                  rows="2"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-upload"
              disabled={uploading}
            >
              <Upload size={16} />
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
          )}
        </div>

        {/* Documents List Section */}
        <div className="documents-section">
          <h3 className="section-heading">📋 Uploaded Documents</h3>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading documents...</p>
            </div>
          ) : Object.keys(groupedDocuments).length === 0 ? (
            <div className="empty-state">
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="documents-grid">
              {Object.entries(groupedDocuments).map(([docType, docs]) => (
                <div key={docType} className="document-group">
                  <div
                    className="group-header"
                    onClick={() => setExpandedType(expandedType === docType ? null : docType)}
                  >
                    <span className="group-title">
                      {documentTypes.find(dt => dt.value === docType)?.label || docType}
                    </span>
                    <span className="doc-count">{docs.length}</span>
                  </div>

                  {expandedType === docType && (
                    <div className="group-content">
                      {docs.map(doc => (
                        <div key={doc._id} className="document-item">
                          <div className="doc-info">
                            <div className="doc-name">
                              <span className="doc-title">{doc.documentName}</span>
                              <span className="doc-type">{doc.documentType}</span>
                              {isHRView && <span className="doc-employee">{doc.employeeName}</span>}
                            </div>
                            <div className="doc-meta">
                              <span className="doc-date">
                                {new Date(doc.uploadDate).toLocaleDateString('en-IN')}
                              </span>
                              <span className="doc-size">
                                {(doc.fileSize / 1024).toFixed(2)} KB
                              </span>
                              {isHRView && <span className={`doc-status status-${doc.status?.toLowerCase()}`}>{doc.status}</span>}
                            </div>
                          </div>

                          <div className="doc-actions">
                            <button
                              className="btn-action btn-download"
                              onClick={() => handleDownload(doc._id, doc.fileName)}
                              title="Download"
                            >
                              <Download size={16} />
                            </button>
                            {isHRView && doc.status === 'Pending' && (
                              <>
                                <button
                                  className="btn-action btn-approve"
                                  onClick={() => handleApprove(doc._id)}
                                  title="Approve"
                                >
                                  ✓
                                </button>
                                <button
                                  className="btn-action btn-reject"
                                  onClick={() => handleReject(doc._id)}
                                  title="Reject"
                                >
                                  ✕
                                </button>
                              </>
                            )}
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDelete(doc._id)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentManager;
