import Notification from '../models/Notification.js';

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const limit = req.query.limit || 20;
    const skip = (req.query.page - 1) * limit || 0;

    const notifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('data.employeeId', 'name email')
      .populate('data.projectId', 'name');

    const total = await Notification.countDocuments({ recipientId: userId });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: req.query.page || 1,
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Get unread notifications count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const count = await Notification.countDocuments({
      recipientId: userId,
      isRead: false
    });

    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id || req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id || req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipientId: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

// Create notification (internal function)
export const createNotification = async (recipientId, notificationData) => {
  try {
    const notification = new Notification({
      recipientId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data || {},
      icon: notificationData.icon || 'employee',
      priority: notificationData.priority || 'medium',
      link: notificationData.link
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};
