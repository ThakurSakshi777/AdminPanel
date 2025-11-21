import { Bell, User, LogOut, Search, Menu, Clock, X, Calendar, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDateRange } from '../context/DateContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Header = ({ onMenuClick, isSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dateRange, setDateRange } = useDateRange();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [showExportSettings, setShowExportSettings] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    format: 'pdf',
    fileName: '',
    dateRange: true,
    selectedColumns: []
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'user',
      title: 'New User Registration',
      message: 'Rahul Sharma just registered as a customer',
      time: '5 mins ago',
      timestamp: new Date(Date.now() - 5 * 60000),
      isRead: false,
      link: '/users'
    },
    {
      id: 2,
      type: 'inquiry',
      title: 'Property Inquiry',
      message: 'Priya Patel inquired about Villa with Garden',
      time: '15 mins ago',
      timestamp: new Date(Date.now() - 15 * 60000),
      isRead: false,
      link: '/inquiries'
    },
    {
      id: 3,
      type: 'complaint',
      title: 'Complaint Registered',
      message: 'Water leakage issue reported in Apartment #123',
      time: '30 mins ago',
      timestamp: new Date(Date.now() - 30 * 60000),
      isRead: false,
      link: '/complaints'
    },
    {
      id: 4,
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of ₹1.2 Cr received from Vikram Singh',
      time: '1 hour ago',
      timestamp: new Date(Date.now() - 60 * 60000),
      isRead: true,
      link: '/properties'
    },
    {
      id: 5,
      type: 'system',
      title: 'System Update',
      message: 'Database backup completed successfully',
      time: '2 hours ago',
      timestamp: new Date(Date.now() - 120 * 60000),
      isRead: true,
      link: '/'
    }
  ]);
  const searchRef = useRef(null);
  const datePickerRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const exportRef = useRef(null);

  // User data
  const userData = {
    name: 'Young Alaska',
    email: 'alaska@gmail.com',
    avatar: 'YA',
    role: 'Admin'
  };

  // Profile menu items
  const profileMenuItems = [
    { icon: '📊', label: 'My Dashboard', link: '/' },
    { icon: '👤', label: 'Profile Settings', link: '/profile' },
    { icon: '🔐', label: 'Change Password', link: '/change-password' },
    { icon: '⚙️', label: 'Account Settings', link: '/settings' },
    { icon: '🌙', label: 'Dark Mode', action: 'toggle-dark-mode' },
    { icon: '📥', label: 'Download Reports', action: 'download-reports' },
    { icon: '❌', label: 'Logout', action: 'logout', danger: true }
  ];

  // Export options
  const exportOptions = [
    { icon: '📄', label: 'Export as PDF', format: 'pdf', description: 'Download as PDF document' },
    { icon: '📊', label: 'Export as Excel', format: 'xlsx', description: 'Microsoft Excel format' },
    { icon: '📑', label: 'Export as CSV', format: 'csv', description: 'Comma-separated values' },
    { icon: '📋', label: 'Copy to Clipboard', format: 'clipboard', description: 'Copy data to clipboard' }
  ];

  // Current page detection
  const currentPage = location.pathname.split('/')[1] || 'dashboard';

  // Page-specific columns
  const getPageColumns = () => {
    const columnsMap = {
      'dashboard': ['Date', 'Metric', 'Value', 'Change'],
      'users': ['Name', 'Email', 'Role', 'Status', 'Joined Date'],
      'properties': ['Property Name', 'Location', 'Price', 'Type', 'Status'],
      'inquiries': ['Customer', 'Property', 'Date', 'Status', 'Priority'],
      'complaints': ['Title', 'Category', 'Status', 'Priority', 'Date'],
      'listings': ['Property', 'Agent', 'Price', 'Status', 'Date'],
      'services': ['Service', 'Provider', 'Status', 'Cost', 'Date'],
      'security': ['Event', 'User', 'Action', 'IP Address', 'Timestamp']
    };
    return columnsMap[currentPage] || [];
  };

  // Notification types configuration
  const notificationTypes = {
    user: { icon: '👤', color: '#0d9488', bgColor: 'rgba(13, 148, 136, 0.1)' },
    property: { icon: '🏠', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
    inquiry: { icon: '📨', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
    complaint: { icon: '⚠', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
    payment: { icon: '💰', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    system: { icon: '⚙️', color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.1)' }
  };

  // Unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Search data - All searchable items
  const searchData = [
    // Pages
    { id: 1, type: 'page', name: 'Dashboard', path: '/', icon: '🏠', category: 'Navigation' },
    { id: 2, type: 'page', name: 'Users Management', path: '/users', icon: '👤', category: 'Navigation' },
    { id: 3, type: 'page', name: 'Properties', path: '/properties', icon: '🏘', category: 'Navigation' },
    { id: 4, type: 'page', name: 'Listings', path: '/listings', icon: '📍', category: 'Navigation' },
    { id: 5, type: 'page', name: 'Inquiries', path: '/inquiries', icon: '📨', category: 'Navigation' },
    { id: 6, type: 'page', name: 'Complaints', path: '/complaints', icon: '⚠', category: 'Navigation' },
    { id: 7, type: 'page', name: 'Services', path: '/services', icon: '🛠', category: 'Navigation' },
    { id: 8, type: 'page', name: 'Security Settings', path: '/security', icon: '🔐', category: 'Navigation' },
    
    // Users
    { id: 10, type: 'user', name: 'Rahul Sharma', path: '/users', icon: '👤', category: 'Users' },
    { id: 11, type: 'user', name: 'Priya Patel', path: '/users', icon: '👤', category: 'Users' },
    { id: 12, type: 'user', name: 'Amit Kumar', path: '/users', icon: '👤', category: 'Users' },
    { id: 13, type: 'user', name: 'Sneha Desai', path: '/users', icon: '👤', category: 'Users' },
    
    // Properties
    { id: 20, type: 'property', name: '3BHK Luxury Apartment Mumbai', path: '/properties', icon: '🏠', category: 'Properties' },
    { id: 21, type: 'property', name: '2BHK Modern Flat Pune', path: '/properties', icon: '🏠', category: 'Properties' },
    { id: 22, type: 'property', name: 'Villa with Garden Bangalore', path: '/properties', icon: '🏠', category: 'Properties' },
    { id: 23, type: 'property', name: 'Commercial Space Delhi', path: '/properties', icon: '🏢', category: 'Properties' },
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        setRecentSearches([]);
      }
    }
  }, []);

  // Window resize detection for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when screen size changes
  useEffect(() => {
    if (!isMobile) {
      // Close all dropdowns when switching to desktop
      setIsSearchOpen(false);
      setIsDatePickerOpen(false);
      setIsNotificationOpen(false);
      setIsProfileOpen(false);
      setIsExportOpen(false);
    }
  }, [isMobile]);

  // Dark mode effect
  useEffect(() => {
    console.log('Dark Mode Changed:', isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
      console.log('Dark mode classes added');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
      console.log('Dark mode classes removed');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+F or Cmd+F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
        setIsSearchOpen(true);
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
        setShowTooltip(false);
      }
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Date presets
  const datePresets = [
    {
      label: 'Today',
      getValue: () => ({
        startDate: new Date(),
        endDate: new Date(),
        label: 'Today'
      })
    },
    {
      label: 'Last 7 days',
      getValue: () => ({
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
        endDate: new Date(),
        label: 'Last 7 days'
      })
    },
    {
      label: 'Last 30 days',
      getValue: () => ({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
        endDate: new Date(),
        label: 'Last 30 days'
      })
    },
    {
      label: 'This Month',
      getValue: () => {
        const now = new Date();
        return {
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: new Date(),
          label: 'This Month'
        };
      }
    },
    {
      label: 'Last Month',
      getValue: () => {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          startDate: lastMonth,
          endDate: lastDay,
          label: 'Last Month'
        };
      }
    }
  ];

  // Format date for display
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }).format(new Date(date));
  };

  // Handle preset selection
  const handlePresetClick = (preset) => {
    const newRange = preset.getValue();
    setDateRange(newRange);
    setIsDatePickerOpen(false);
    setCustomStartDate('');
    setCustomEndDate('');
  };

  // Handle custom date apply
  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      setDateRange({
        startDate: new Date(customStartDate),
        endDate: new Date(customEndDate),
        label: 'Custom Range'
      });
      setIsDatePickerOpen(false);
    }
  };

  // Mark single notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    navigate(notification.link);
    setIsNotificationOpen(false);
  };

  // Handle profile menu item click
  const handleMenuItemClick = (item) => {
    if (item.link) {
      navigate(item.link);
    } else if (item.action === 'toggle-dark-mode') {
      // Dark mode toggle
      console.log('Toggle dark mode clicked, current state:', isDarkMode);
      setIsDarkMode(prev => {
        console.log('Changing from', prev, 'to', !prev);
        return !prev;
      });
    } else if (item.action === 'logout') {
      // Logout logic
      localStorage.clear();
      navigate('/login');
    } else if (item.action === 'download-reports') {
      // Download functionality
      console.log('Downloading reports...');
    }
    setIsProfileOpen(false);
  };

  // Handle avatar click - navigate to profile
  const handleAvatarClick = () => {
    navigate('/profile');
    setIsProfileOpen(false);
  };

  // Get current page data
  const getCurrentPageData = () => {
    const dataMap = {
      'dashboard': [
        { Date: '2024-11-21', Metric: 'Total Users', Value: '1,234', Change: '+12%' },
        { Date: '2024-11-21', Metric: 'Properties', Value: '456', Change: '+8%' },
        { Date: '2024-11-21', Metric: 'Inquiries', Value: '89', Change: '+15%' },
        { Date: '2024-11-21', Metric: 'Revenue', Value: '₹45.2L', Change: '+23%' }
      ],
      'users': [
        { Name: 'Rahul Sharma', Email: 'rahul@example.com', Role: 'Customer', Status: 'Active', 'Joined Date': '2024-01-15' },
        { Name: 'Priya Patel', Email: 'priya@example.com', Role: 'Agent', Status: 'Active', 'Joined Date': '2024-02-20' }
      ],
      'properties': [
        { 'Property Name': '3BHK Apartment', Location: 'Mumbai', Price: '₹1.2 Cr', Type: 'Apartment', Status: 'Available' },
        { 'Property Name': 'Villa with Garden', Location: 'Bangalore', Price: '₹2.5 Cr', Type: 'Villa', Status: 'Sold' }
      ]
    };
    return dataMap[currentPage] || [];
  };

  // Export to PDF
  const exportToPDF = (data, fileName, columns) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`${currentPage.toUpperCase()} Report`, 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    
    if (exportSettings.dateRange) {
      doc.text(`Date Range: ${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`, 14, 38);
    }
    
    doc.autoTable({
      startY: 45,
      head: [columns],
      body: data.map(row => columns.map(col => row[col] || '')),
      theme: 'grid',
      headStyles: { fillColor: [13, 148, 136] },
      styles: { fontSize: 9 }
    });
    
    doc.save(`${fileName || currentPage}-report.pdf`);
  };

  // Export to Excel
  const exportToExcel = (data, fileName, columns) => {
    const filteredData = data.map(row => {
      const filtered = {};
      columns.forEach(col => {
        filtered[col] = row[col] || '';
      });
      return filtered;
    });
    
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, currentPage);
    
    XLSX.writeFile(workbook, `${fileName || currentPage}-report.xlsx`);
  };

  // Export to CSV
  const exportToCSV = (data, fileName, columns) => {
    const csvContent = [
      columns.join(','),
      ...data.map(row => columns.map(col => `"${row[col] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${fileName || currentPage}-report.csv`);
  };

  // Copy to clipboard
  const handleCopyToClipboard = () => {
    const data = getCurrentPageData();
    const text = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Data copied to clipboard!');
    });
    setIsExportOpen(false);
  };

  // Handle export option click
  const handleExportClick = (option) => {
    setExportSettings(prev => ({ ...prev, format: option.format }));
    
    if (option.format === 'clipboard') {
      handleCopyToClipboard();
    } else {
      // Initialize selected columns
      const allColumns = getPageColumns();
      setExportSettings(prev => ({ ...prev, selectedColumns: allColumns }));
      setShowExportSettings(true);
      setIsExportOpen(false);
    }
  };

  // Handle final export
  const handleFinalExport = () => {
    const data = getCurrentPageData();
    const { format, fileName, selectedColumns } = exportSettings;
    const columns = selectedColumns.length > 0 ? selectedColumns : getPageColumns();
    
    if (format === 'pdf') {
      exportToPDF(data, fileName, columns);
    } else if (format === 'xlsx') {
      exportToExcel(data, fileName, columns);
    } else if (format === 'csv') {
      exportToCSV(data, fileName, columns);
    }
    
    setShowExportSettings(false);
    alert('✅ Export successful!');
  };

  // Handle column toggle
  const handleColumnToggle = (column) => {
    setExportSettings(prev => {
      const selected = prev.selectedColumns.includes(column)
        ? prev.selectedColumns.filter(c => c !== column)
        : [...prev.selectedColumns, column];
      return { ...prev, selectedColumns: selected };
    });
  };

  // Real-time search filtering
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 0) {
      const filtered = searchData.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 8)); // Show max 8 results
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
    }
  };

  // Save to recent searches
  const saveToRecent = (query) => {
    let recent = [...recentSearches];
    
    // Remove duplicate
    recent = recent.filter(item => item !== query);
    
    // Add at beginning
    recent.unshift(query);
    
    // Keep max 5 recent
    recent = recent.slice(0, 5);
    
    setRecentSearches(recent);
    localStorage.setItem('recentSearches', JSON.stringify(recent));
  };

  // Handle result click
  const handleResultClick = (result) => {
    saveToRecent(result.name);
    navigate(result.path);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Handle recent search click
  const handleRecentClick = (search) => {
    setSearchQuery(search);
    const filtered = searchData.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    setSearchResults(filtered.slice(0, 8));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // If there are results, navigate to first result
      if (searchResults.length > 0) {
        handleResultClick(searchResults[0]);
      }
    }
  };

  return (
    <header className={`header ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
      <div className="header-left">
        {/* Hamburger Menu - Show only when sidebar is closed */}
        {!isSidebarOpen && (
          <button 
            className="hamburger-menu"
            onClick={onMenuClick}
          >
            <Menu size={24} />
          </button>
        )}

        {/* Logo/Title for Mobile */}
        {isMobile && (
          <div className="mobile-logo">
            <h2>RentifyPro</h2>
          </div>
        )}

        {/* Search - Desktop/Tablet */}
        {!isMobile && (
          <div className="search-wrapper" ref={searchRef}>
          <div className="search-header">
            <Search size={18} />
            <input
              id="global-search"
              type="text"
              placeholder="⌘ F  Search"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchOpen(true)}
              onKeyPress={handleKeyPress}
            />
            {searchQuery && (
              <button 
                className="search-clear"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && (
            <div className="search-dropdown">
              {/* Recent Searches */}
              {!searchQuery && recentSearches.length > 0 && (
                <div className="search-section">
                  <div className="search-section-header">
                    <p className="search-label">Recent Searches</p>
                    <button className="clear-btn" onClick={clearRecentSearches}>
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((search, idx) => (
                    <div 
                      key={idx} 
                      className="search-item recent"
                      onClick={() => handleRecentClick(search)}
                    >
                      <Clock size={16} />
                      <span>{search}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Links */}
              {!searchQuery && (
                <div className="search-section">
                  <p className="search-label">Quick Links</p>
                  {searchData.slice(0, 5).map((item) => (
                    <div 
                      key={item.id} 
                      className="search-item"
                      onClick={() => handleResultClick(item)}
                    >
                      <span className="search-icon">{item.icon}</span>
                      <div className="search-item-content">
                        <p className="search-item-name">{item.name}</p>
                        <span className="search-item-type">{item.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Results */}
              {searchQuery && searchResults.length > 0 && (
                <div className="search-section">
                  <p className="search-label">Results ({searchResults.length})</p>
                  {searchResults.map((result) => (
                    <div 
                      key={result.id} 
                      className="search-item"
                      onClick={() => handleResultClick(result)}
                    >
                      <span className="search-icon">{result.icon}</span>
                      <div className="search-item-content">
                        <p className="search-item-name">{result.name}</p>
                        <span className="search-item-type">{result.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results */}
              {searchQuery && searchResults.length === 0 && (
                <div className="no-results">
                  <Search size={32} />
                  <p>No results found for "{searchQuery}"</p>
                  <span>Try searching for users, properties, or pages</span>
                </div>
              )}
            </div>
          )}
        </div>
        )}
      </div>

      {/* Mobile Search Bar - Below Header */}
      {isMobile && (
        <div className="mobile-search-bar">
          <div className="search-wrapper mobile" ref={searchRef}>
            <div className="search-header">
              <Search size={18} />
              <input
                id="global-search-mobile"
                type="text"
                placeholder="Search pages, users, properties..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchOpen(true)}
                onKeyPress={handleKeyPress}
              />
              {searchQuery && (
                <button 
                  className="search-clear"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Mobile Search Dropdown - Full Screen */}
            {isSearchOpen && (
              <div className="search-dropdown mobile-fullscreen">
                {/* Same search content */}
                {!searchQuery && recentSearches.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-header">
                      <p className="search-label">Recent Searches</p>
                      <button className="clear-btn" onClick={clearRecentSearches}>Clear</button>
                    </div>
                    {recentSearches.map((search, idx) => (
                      <div 
                        key={idx} 
                        className="search-item recent"
                        onClick={() => handleRecentClick(search)}
                      >
                        <Clock size={16} />
                        <span>{search}</span>
                      </div>
                    ))}
                  </div>
                )}

                {!searchQuery && (
                  <div className="search-section">
                    <p className="search-label">Quick Links</p>
                    {searchData.slice(0, 5).map((item) => (
                      <div 
                        key={item.id} 
                        className="search-item"
                        onClick={() => handleResultClick(item)}
                      >
                        <span className="search-icon">{item.icon}</span>
                        <div className="search-item-content">
                          <p className="search-item-name">{item.name}</p>
                          <span className="search-item-type">{item.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery && searchResults.length > 0 && (
                  <div className="search-section">
                    <p className="search-label">Results ({searchResults.length})</p>
                    {searchResults.map((result) => (
                      <div 
                        key={result.id} 
                        className="search-item"
                        onClick={() => handleResultClick(result)}
                      >
                        <span className="search-icon">{result.icon}</span>
                        <div className="search-item-content">
                          <p className="search-item-name">{result.name}</p>
                          <span className="search-item-type">{result.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery && searchResults.length === 0 && (
                  <div className="no-results">
                    <Search size={32} />
                    <p>No results found for "{searchQuery}"</p>
                    <span>Try searching for users, properties, or pages</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="header-right">
        {/* Date Picker - Icon only on mobile */}
        <div className="date-picker-wrapper" ref={datePickerRef}>
          <button 
            className={`date-range ${isMobile || isTablet ? 'icon-only' : ''}`}
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
          >
            <Calendar size={16} />
            {!isMobile && !isTablet && (
              <>
                <span>{formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}</span>
                <span className="period">{dateRange.label}</span>
              </>
            )}
            <ChevronDown size={14} />
          </button>

          {isDatePickerOpen && (
            <div className={`date-picker-dropdown ${isMobile ? 'mobile-fullscreen' : ''}`}>
              {/* Preset Options */}
              <div className="date-presets">
                <p className="preset-label">Quick Select</p>
                {datePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    className={`preset-btn ${dateRange.label === preset.label ? 'active' : ''}`}
                    onClick={() => handlePresetClick(preset)}
                  >
                    <span className="preset-radio">{dateRange.label === preset.label ? '●' : '○'}</span>
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Picker */}
              <div className="custom-date-picker">
                <p className="preset-label">Custom Range</p>
                <div className="date-inputs">
                  <div className="date-input-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      max={customEndDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="date-input-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      min={customStartDate}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                <button 
                  className="apply-btn"
                  onClick={handleCustomDateApply}
                  disabled={!customStartDate || !customEndDate}
                >
                  Apply Custom Range
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notification Dropdown */}
        <div className="notification-wrapper" ref={notificationRef}>
          <button 
            className="icon-btn-header notification-btn"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="badge-header notification-badge">{unreadCount}</span>
            )}
          </button>

          {isNotificationOpen && (
            <div className={`notification-dropdown ${isMobile ? 'mobile-fullscreen' : ''}`}>
              {/* Header */}
              <div className="notification-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    className="mark-all-read"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div 
                        className="notif-icon"
                        style={{ 
                          backgroundColor: notificationTypes[notif.type].bgColor 
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>
                          {notificationTypes[notif.type].icon}
                        </span>
                      </div>
                      <div className="notif-content">
                        <p className="notif-title">{notif.title}</p>
                        <p className="notif-message">{notif.message}</p>
                        <span className="notif-time">{notif.time}</span>
                      </div>
                      {!notif.isRead && <div className="unread-dot"></div>}
                    </div>
                  ))
                ) : (
                  <div className="no-notifications">
                    <Bell size={32} />
                    <p>No notifications</p>
                    <span>You're all caught up!</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="notification-footer">
                  <button 
                    className="view-all-btn"
                    onClick={() => {
                      navigate('/notifications');
                      setIsNotificationOpen(false);
                    }}
                  >
                    View All Notifications →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="user-profile-wrapper" ref={profileRef}>
          <div className="profile-button-container">
            <button 
              className="user-profile-btn"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              onMouseEnter={() => !isMobile && setShowTooltip(true)}
              onMouseLeave={() => !isMobile && setShowTooltip(false)}
            >
              <div className="user-avatar">{userData.avatar}</div>
              {!isMobile && !isTablet && (
                <div className="user-info">
                  <span className="user-name">{userData.name}</span>
                  <span className="user-email">{userData.email}</span>
                </div>
              )}
              <ChevronDown 
                size={16} 
                className={`profile-chevron ${isProfileOpen ? 'rotate' : ''}`}
              />
            </button>

            {/* Hover Tooltip */}
            {showTooltip && !isProfileOpen && (
              <div className="profile-tooltip">
                <p className="tooltip-name">{userData.name}</p>
                <p className="tooltip-email">{userData.email}</p>
                <p className="tooltip-role">{userData.role}</p>
              </div>
            )}
          </div>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className={`profile-dropdown ${isMobile ? 'mobile-fullscreen' : ''}`}>
              {/* User Info Section */}
              <div className="profile-dropdown-header" onClick={handleAvatarClick}>
                <div className="profile-avatar-large">{userData.avatar}</div>
                <div className="profile-info">
                  <p className="profile-name">{userData.name}</p>
                  <p className="profile-email">{userData.email}</p>
                  <span className="profile-badge">{userData.role}</span>
                </div>
              </div>

              <div className="profile-divider"></div>

              {/* Menu Items */}
              <div className="profile-menu-list">
                {profileMenuItems.map((item, index) => (
                  <button
                    key={index}
                    className={`profile-menu-item ${item.danger ? 'danger' : ''}`}
                    onClick={() => handleMenuItemClick(item)}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-label">{item.label}</span>
                    {item.action === 'toggle-dark-mode' && (
                      <div className={`toggle-switch ${isDarkMode ? 'active' : ''}`}>
                        <div className="toggle-slider"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Export Dropdown */}
        <div className="export-wrapper" ref={exportRef}>
          <button 
            className="export-btn"
            onClick={() => setIsExportOpen(!isExportOpen)}
          >
            🎯 {!isMobile && !isTablet && 'Export'}
            <ChevronDown size={16} className={`export-chevron ${isExportOpen ? 'rotate' : ''}`} />
          </button>

          {isExportOpen && (
            <div className={`export-dropdown ${isMobile ? 'mobile-fullscreen' : ''}`}>
              <div className="export-header">
                <h4>Export Options</h4>
                <p className="export-page-name">Page: {currentPage}</p>
              </div>
              
              <div className="export-options-list">
                {exportOptions.map((option, index) => (
                  <button
                    key={index}
                    className="export-option-item"
                    onClick={() => handleExportClick(option)}
                  >
                    <span className="export-icon">{option.icon}</span>
                    <div className="export-info">
                      <p className="export-label">{option.label}</p>
                      <span className="export-description">{option.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Export Settings Modal */}
        {showExportSettings && (
          <div className="export-settings-modal">
            <div className="modal-overlay" onClick={() => setShowExportSettings(false)}></div>
            <div className="modal-content">
              <div className="modal-header">
                <h3>📊 Export Settings</h3>
                <button className="modal-close" onClick={() => setShowExportSettings(false)}>✕</button>
              </div>
              
              <div className="modal-body">
                {/* File Name */}
                <div className="form-group">
                  <label>File Name</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder={`${currentPage}-report`}
                    value={exportSettings.fileName}
                    onChange={(e) => setExportSettings({...exportSettings, fileName: e.target.value})}
                  />
                </div>

                {/* Date Range Toggle */}
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={exportSettings.dateRange}
                      onChange={(e) => setExportSettings({...exportSettings, dateRange: e.target.checked})}
                    />
                    <span>Include Date Range: {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}</span>
                  </label>
                </div>

                {/* Column Selection */}
                <div className="form-group">
                  <label>Select Columns to Export</label>
                  <div className="column-checkboxes">
                    {getPageColumns().map((col, idx) => (
                      <label key={idx} className="checkbox-label">
                        <input 
                          type="checkbox" 
                          checked={exportSettings.selectedColumns.includes(col)}
                          onChange={() => handleColumnToggle(col)}
                        />
                        <span>{col}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Format Display */}
                <div className="form-group">
                  <label>Export Format</label>
                  <div className="format-badge">
                    {exportSettings.format.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary-modal" onClick={() => setShowExportSettings(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-primary-modal" 
                  onClick={handleFinalExport}
                  disabled={exportSettings.selectedColumns.length === 0}
                >
                  🎯 Export Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
