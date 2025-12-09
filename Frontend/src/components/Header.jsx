import { Bell, User, LogOut, Search, Menu, Clock, X, Calendar, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDateRange } from '../context/DateContext';
import { useAuth } from '../context/useAuth';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/hrService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Header = ({ onMenuClick, isSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dateRange, setDateRange } = useDateRange();
  const { logout, user } = useAuth();
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
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const searchRef = useRef(null);
  const datePickerRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // User data - Get from AuthContext or localStorage
  const userData = {
    name: user?.name || localStorage.getItem('userName') || 'User',
    email: user?.email || localStorage.getItem('userEmail') || 'user@example.com',
    avatar: (user?.name || localStorage.getItem('userName') || 'User').split(' ').map(n => n[0]).join(''),
    role: user?.role || localStorage.getItem('userRole') || 'Employee',
    department: user?.department || localStorage.getItem('userDepartment') || 'N/A',
    shift: localStorage.getItem('shift') || 'N/A',
    jobTitle: user?.position || localStorage.getItem('userPosition') || 'N/A',
    joinDate: user?.joinDate || localStorage.getItem('joinDate') || 'N/A',
    reportingManager: localStorage.getItem('reportingManager') || 'N/A',
    phone: user?.phone || localStorage.getItem('userPhone') || 'N/A',
    location: localStorage.getItem('location') || 'N/A'
  };

  // Profile menu items - OMS HR-specific (Lightweight - 5 Essential Items Only)
  const profileMenuItems = [
    { icon: '🌙', label: 'Dark Mode', action: 'toggle-dark-mode' },
    { icon: '💰', label: 'Salary Slip', link: '/salary-slip', category: 'HR' },
    { icon: '📅', label: 'My Leave Balance', link: '/leave-balance', category: 'HR', badge: '12 days' },
    { icon: '🚪', label: 'Logout', action: 'logout', danger: true }
  ];

  // Current page detection
  const currentPage = location.pathname.split('/')[1] || 'dashboard';

  // Page-specific columns
  const getPageColumns = () => {
    const columnsMap = {
      'dashboard': ['Date', 'Metric', 'Value', 'Change'],
      'users': ['Name', 'Email', 'Role', 'Status', 'Joined Date'],
      'employees': ['Employee ID', 'Name', 'Department', 'Position', 'Status'],
      'attendance': ['Employee', 'Date', 'Check-in', 'Check-out', 'Status'],
      'leaves': ['Employee', 'Type', 'Start Date', 'End Date', 'Status'],
      'projects': ['Project Name', 'Status', 'Priority', 'Progress', 'Team'],
      'performance': ['Employee', 'Category', 'Rating', 'Reviewer', 'Date'],
      'employee-profile': ['Employee', 'Department', 'Contact', 'Status', 'Documents'],
      'announcements': ['Title', 'Audience', 'Status', 'Expiry', 'Created By'],
      'reports': ['Report Type', 'Period', 'Format', 'Generated', 'Records'],
      'listings': ['Property', 'Agent', 'Price', 'Status', 'Date'],
      'security': ['Event', 'User', 'Action', 'IP Address', 'Timestamp']
    };
    return columnsMap[currentPage] || [];
  };

  // Notification types configuration
  const notificationTypes = {
    employee: { icon: '👥', color: '#0d9488', bgColor: 'rgba(13, 148, 136, 0.1)' },
    leave: { icon: '📅', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
    announcement: { icon: '📢', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
    attendance: { icon: '⏰', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    project: { icon: '📋', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
    performance: { icon: '⭐', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.1)' },
    system: { icon: '⚙️', color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.1)' }
  };

  // Unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Search data - All searchable items
  const searchData = [
    // Pages
    { id: 1, type: 'page', name: 'Dashboard', path: '/dashboard', icon: '🏠', category: 'Navigation' },
    { id: 2, type: 'page', name: 'Employees', path: '/employees', icon: '👥', category: 'Navigation' },
    { id: 3, type: 'page', name: 'Attendance', path: '/attendance', icon: '⏰', category: 'Navigation' },
    { id: 4, type: 'page', name: 'Employee Profile', path: '/employee-profile', icon: '👤', category: 'Navigation' },
    { id: 5, type: 'page', name: 'Leave Management', path: '/leaves', icon: '📅', category: 'Navigation' },
    { id: 6, type: 'page', name: 'Projects', path: '/projects', icon: '📋', category: 'Navigation' },
    { id: 7, type: 'page', name: 'Performance Reviews', path: '/performance', icon: '⭐', category: 'Navigation' },
    { id: 8, type: 'page', name: 'Reports', path: '/reports', icon: '📊', category: 'Navigation' },
    { id: 9, type: 'page', name: 'Announcements', path: '/announcements', icon: '📢', category: 'Navigation' },
    { id: 10, type: 'page', name: 'Security', path: '/security', icon: '🔐', category: 'Navigation' },
    
    // Employees
    { id: 20, type: 'employee', name: 'Raj Kumar', path: '/employees', icon: '👥', category: 'Employees' },
    { id: 21, type: 'employee', name: 'Priya Singh', path: '/employees', icon: '👥', category: 'Employees' },
    { id: 22, type: 'employee', name: 'Amit Patel', path: '/employees', icon: '👥', category: 'Employees' },
    { id: 23, type: 'employee', name: 'Neha Sharma', path: '/employees', icon: '👥', category: 'Employees' },
    
    // Projects
    { id: 30, type: 'project', name: 'CRM System', path: '/projects', icon: '📋', category: 'Projects' },
    { id: 31, type: 'project', name: 'E-commerce Portal', path: '/projects', icon: '🛒', category: 'Projects' },
    { id: 32, type: 'project', name: 'Mobile App Development', path: '/projects', icon: '📱', category: 'Projects' },
    { id: 33, type: 'project', name: 'Data Analytics Dashboard', path: '/projects', icon: '📊', category: 'Projects' },
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

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const response = await getNotifications(1, 10);
        if (response.success && response.data) {
          // Convert API notification format to display format
          const formattedNotifications = response.data.map(notif => ({
            id: notif._id,
            type: getNotificationType(notif.type),
            title: notif.title,
            message: notif.message,
            time: formatTimeAgo(notif.createdAt),
            timestamp: new Date(notif.createdAt),
            isRead: notif.isRead,
            link: notif.link || '/notifications',
            _id: notif._id
          }));
          setNotifications(formattedNotifications);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper function to convert notification type
  const getNotificationType = (apiType) => {
    const typeMap = {
      'leave_request': 'leave',
      'leave_approved': 'leave',
      'leave_rejected': 'leave',
      'new_employee': 'employee',
      'announcement': 'announcement',
      'project_update': 'project',
      'attendance_marked': 'attendance',
      'performance_review': 'performance',
      'task_assigned': 'project',
      'task_completed': 'project'
    };
    return typeMap[apiType] || 'system';
  };

  // Helper function to format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

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
  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId || notif._id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    markAsRead(notification._id || notification.id);
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
      // Logout logic - use AuthContext
      console.log('Logging out...');
      logout();
      setIsProfileOpen(false);
      // Clear all local storage completely
      localStorage.clear();
      // Navigate to home which will redirect to login
      navigate('/', { replace: true });
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
        {/* Logo/Title for Mobile */}
        {isMobile && (
          <div className="mobile-logo">
            <h2>🏢 OMS</h2>
          </div>
        )}

        {/* Hamburger Menu - Show only when sidebar is closed */}
        {!isSidebarOpen && (
          <button 
            className="hamburger-menu"
            onClick={onMenuClick}
          >
            <Menu size={24} />
          </button>
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
                  <span>Try searching for employees, projects, or pages</span>
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
                placeholder="Search pages, employees, projects..."
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
                    <span>Try searching for employees, projects, or pages</span>
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
              {/* User Info Section - Enhanced with HR Data */}
              <div className="profile-dropdown-header" onClick={handleAvatarClick}>
                <div className="profile-avatar-large">{userData.avatar}</div>
                <div className="profile-info">
                  <p className="profile-name">{userData.name}</p>
                  <p className="profile-email">{userData.email}</p>
                  <span className="profile-badge">{userData.role}</span>
                  <div className="profile-hr-info">
                    <span className="profile-hr-item">🏢 {userData.department}</span>
                    <span className="profile-hr-item">⏰ {userData.shift}</span>
                  </div>
                  <div className="profile-hr-meta">
                    <p className="profile-meta-text">{userData.jobTitle} • {userData.location}</p>
                  </div>
                </div>
              </div>

              <div className="profile-divider"></div>

              {/* Menu Items - Super Minimal (4 Items Only) */}
              <div className="profile-menu-list">
                {profileMenuItems.map((item, index) => (
                  <button
                    key={index}
                    className={`profile-menu-item ${item.danger ? 'danger' : ''} ${item.category ? 'hr-item' : ''}`}
                    onClick={() => handleMenuItemClick(item)}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-label">{item.label}</span>
                    {item.badge && (
                      <span className="menu-badge">{item.badge}</span>
                    )}
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
      </div>
    </header>
  );
};

export default Header;
