const Notifications = () => {
  const notifications = [
    {
      id: 1,
      type: 'user',
      title: 'New User Registration',
      message: 'Rahul Sharma just registered as a customer',
      time: '5 mins ago',
      date: 'Nov 21, 2024',
      isRead: false
    },
    {
      id: 2,
      type: 'inquiry',
      title: 'Property Inquiry',
      message: 'Priya Patel inquired about Villa with Garden in Bangalore',
      time: '15 mins ago',
      date: 'Nov 21, 2024',
      isRead: false
    },
    {
      id: 3,
      type: 'complaint',
      title: 'Complaint Registered',
      message: 'Water leakage issue reported in 3BHK Apartment #123',
      time: '30 mins ago',
      date: 'Nov 21, 2024',
      isRead: false
    },
    {
      id: 4,
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of ₹1.2 Cr received from Vikram Singh for Commercial Space',
      time: '1 hour ago',
      date: 'Nov 21, 2024',
      isRead: true
    },
    {
      id: 5,
      type: 'property',
      title: 'New Property Listed',
      message: 'Sneha Desai listed a new property: 2BHK Apartment in Pune',
      time: '2 hours ago',
      date: 'Nov 21, 2024',
      isRead: true
    },
    {
      id: 6,
      type: 'system',
      title: 'System Update',
      message: 'Database backup completed successfully',
      time: '3 hours ago',
      date: 'Nov 21, 2024',
      isRead: true
    }
  ];

  const notificationTypes = {
    user: { icon: '👤', color: '#0d9488', bgColor: 'rgba(13, 148, 136, 0.1)' },
    property: { icon: '🏠', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
    inquiry: { icon: '📨', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
    complaint: { icon: '⚠', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
    payment: { icon: '💰', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    system: { icon: '⚙️', color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.1)' }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>All Notifications</h2>
          <p className="subtitle">{unreadCount} unread notifications</p>
        </div>
        <button className="btn-primary-modern">
          ✓ Mark All as Read
        </button>
      </div>

      <div className="notifications-page-list">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`notification-page-item ${!notif.isRead ? 'unread' : ''}`}
          >
            <div 
              className="notif-page-icon"
              style={{ 
                backgroundColor: notificationTypes[notif.type].bgColor 
              }}
            >
              <span style={{ fontSize: '24px' }}>
                {notificationTypes[notif.type].icon}
              </span>
            </div>
            <div className="notif-page-content">
              <div className="notif-page-header">
                <h3 className="notif-page-title">{notif.title}</h3>
                <span className="notif-page-time">{notif.time}</span>
              </div>
              <p className="notif-page-message">{notif.message}</p>
              <span className="notif-page-date">{notif.date}</span>
            </div>
            {!notif.isRead && <div className="unread-indicator"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
