// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Menu, X, ArrowLeft } from 'lucide-react';
import DocumentManager from '../components/DocumentManager';
import '../styles/Documents.css';

const Documents = () => {
  // const navigate = useNavigate();
  // const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // const [userRole, setUserRole] = useState('');

  // useEffect(() => {
  //   const role = localStorage.getItem('userRole');
  //   setUserRole(role);
  // }, []);

  // const handleNavClick = () => {
  //   if (window.innerWidth < 1024) {
  //     setIsSidebarOpen(false);
  //   }
  // };

  return (
    <div className="documents-page">
      {/* <button 
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{ display: window.innerWidth >= 1024 ? 'none' : 'flex' }}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="documents-container">
        <div className="documents-header">
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn-back"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1>📄 {userRole === 'hr' ? 'All Employees Documents' : 'My Documents'}</h1>
          <p>{userRole === 'hr' ? 'View and manage all employee documents' : 'Upload, view, and manage your official documents'}</p>
        </div>

        <div className="documents-content">
          <DocumentManager employeeId={null} isHRView={userRole === 'hr'} />
        </div>
      </div> */}
    </div>
  );
};

export default Documents;
