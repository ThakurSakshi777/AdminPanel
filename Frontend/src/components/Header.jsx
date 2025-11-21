import { Bell, User, LogOut, Search, Menu, Clock, X, Calendar, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDateRange } from '../context/DateContext';

const Header = () => {
  const navigate = useNavigate();
  const { dateRange, setDateRange } = useDateRange();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
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
    <header className="header">
      <div className="header-left">
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
      </div>
      <div className="header-right">
        <div className="date-picker-wrapper" ref={datePickerRef}>
          <button 
            className="date-range"
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
          >
            <Calendar size={16} />
            <span>{formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}</span>
            <span className="period">{dateRange.label}</span>
            <ChevronDown size={14} />
          </button>

          {isDatePickerOpen && (
            <div className="date-picker-dropdown">
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
        <button className="icon-btn-header">
          <Bell size={20} />
          <span className="badge-header">5</span>
        </button>

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
            <div className="notification-dropdown">
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
        <div className="user-info-modern">
          <div className="user-avatar-header">YA</div>
          <div className="user-details">
            <p className="user-name-header">Young Alaska</p>
            <p className="user-email-header">alaska@gmail.com</p>
          </div>
        </div>
        <button className="export-btn">
          🎯 Export
        </button>
      </div>
    </header>
  );
};

export default Header;
