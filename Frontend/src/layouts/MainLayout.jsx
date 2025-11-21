import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for hamburger menu clicks from Header
  useEffect(() => {
    const handleMenuToggle = () => {
      setIsMobileSidebarOpen(prev => !prev);
    };

    window.addEventListener('toggleMobileSidebar', handleMenuToggle);
    return () => window.removeEventListener('toggleMobileSidebar', handleMenuToggle);
  }, []);

  return (
    <div className={`admin-layout ${isMobile ? 'mobile' : ''}`}>
      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}

      <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      <div className="main-content">
        <Header onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
