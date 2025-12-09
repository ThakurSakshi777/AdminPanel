import HRActivity from '../models/HRActivity.js';
import User from '../models/User.js';

// Helper function to get client IP
const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'Unknown'
  );
};

// Helper function to get device info
const getDeviceInfo = (userAgent) => {
  if (!userAgent) return 'Unknown';
  
  if (/mobile|android|iphone|ipod|blackberry/i.test(userAgent)) {
    return 'Mobile';
  } else if (/tablet|ipad/i.test(userAgent)) {
    return 'Tablet';
  } else {
    return 'Desktop';
  }
};

// @desc    Track HR Login
// @route   POST /api/hr-activity/track-login
// @access  Public (called after successful login)
export const trackHRLogin = async (req, res) => {
  try {
    const { userId, email, name } = req.body;

    if (!userId || !email) {
      return res.status(400).json({
        success: false,
        message: 'User ID and email are required',
      });
    }

    // Verify user is HR
    const user = await User.findById(userId);
    if (!user || user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        message: 'Only HR users can be tracked',
      });
    }

    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    const device = getDeviceInfo(userAgent);
    const sessionId = `${userId}-${Date.now()}`;

    // Create activity record
    const activity = await HRActivity.create({
      hrId: userId,
      hrEmail: email,
      hrName: name || user.name,
      activityType: 'login',
      ipAddress,
      userAgent,
      device,
      sessionId,
      status: 'active',
    });

    console.log('✅ HR Login tracked:', {
      email,
      name,
      device,
      ipAddress,
      timestamp: activity.timestamp,
    });

    res.status(201).json({
      success: true,
      message: 'HR login activity tracked successfully',
      data: {
        activityId: activity._id,
        sessionId: activity.sessionId,
      },
    });
  } catch (error) {
    console.error('❌ Track HR Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking HR login',
      error: error.message,
    });
  }
};

// @desc    Track HR Signup
// @route   POST /api/hr-activity/track-signup
// @access  Public (called after successful signup)
export const trackHRSignup = async (req, res) => {
  try {
    const { userId, email, name } = req.body;

    if (!userId || !email) {
      return res.status(400).json({
        success: false,
        message: 'User ID and email are required',
      });
    }

    // Verify user is HR
    const user = await User.findById(userId);
    if (!user || user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        message: 'Only HR users can be tracked',
      });
    }

    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    const device = getDeviceInfo(userAgent);
    const sessionId = `${userId}-${Date.now()}`;

    // Create activity record
    const activity = await HRActivity.create({
      hrId: userId,
      hrEmail: email,
      hrName: name || user.name,
      activityType: 'signup',
      ipAddress,
      userAgent,
      device,
      sessionId,
      status: 'active',
    });

    console.log('✅ HR Signup tracked:', {
      email,
      name,
      device,
      ipAddress,
      timestamp: activity.timestamp,
    });

    res.status(201).json({
      success: true,
      message: 'HR signup activity tracked successfully',
      data: {
        activityId: activity._id,
        sessionId: activity.sessionId,
      },
    });
  } catch (error) {
    console.error('❌ Track HR Signup Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking HR signup',
      error: error.message,
    });
  }
};

// @desc    Track HR Logout
// @route   POST /api/hr-activity/track-logout
// @access  Private
export const trackHRLogout = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    // Find and update the login activity
    const activity = await HRActivity.findOne({
      sessionId,
      hrId: userId,
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity record not found',
      });
    }

    // Create logout record
    const logoutActivity = await HRActivity.create({
      hrId: userId,
      hrEmail: activity.hrEmail,
      hrName: activity.hrName,
      activityType: 'logout',
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || '',
      device: getDeviceInfo(req.headers['user-agent'] || ''),
      sessionId,
      status: 'inactive',
    });

    console.log('✅ HR Logout tracked:', {
      email: activity.hrEmail,
      sessionId,
    });

    res.status(200).json({
      success: true,
      message: 'HR logout activity tracked successfully',
      data: {
        activityId: logoutActivity._id,
      },
    });
  } catch (error) {
    console.error('❌ Track HR Logout Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking HR logout',
      error: error.message,
    });
  }
};

// @desc    Get HR Activity History
// @route   GET /api/hr-activity/history/:hrId
// @access  Private (HR and Admin)
export const getHRActivityHistory = async (req, res) => {
  try {
    const { hrId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Verify the HR user exists
    const hrUser = await User.findById(hrId);
    if (!hrUser || hrUser.role !== 'hr') {
      return res.status(404).json({
        success: false,
        message: 'HR user not found',
      });
    }

    // Get activity history
    const activities = await HRActivity.find({ hrId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await HRActivity.countDocuments({ hrId });

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('❌ Get HR Activity History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity history',
      error: error.message,
    });
  }
};

// @desc    Get All HR Activities (Admin Dashboard)
// @route   GET /api/hr-activity/all
// @access  Private (Admin only)
export const getAllHRActivities = async (req, res) => {
  try {
    const { limit = 100, skip = 0, activityType, status } = req.query;

    let filter = {};
    if (activityType) filter.activityType = activityType;
    if (status) filter.status = status;

    const activities = await HRActivity.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('hrId', 'name email');

    const total = await HRActivity.countDocuments(filter);

    // Calculate statistics
    const loginCount = await HRActivity.countDocuments({ activityType: 'login' });
    const signupCount = await HRActivity.countDocuments({ activityType: 'signup' });
    const logoutCount = await HRActivity.countDocuments({ activityType: 'logout' });

    res.status(200).json({
      success: true,
      data: activities,
      statistics: {
        totalActivities: total,
        logins: loginCount,
        signups: signupCount,
        logouts: logoutCount,
      },
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('❌ Get All HR Activities Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activities',
      error: error.message,
    });
  }
};

// @desc    Get Today's HR Activities
// @route   GET /api/hr-activity/today
// @access  Private (Admin)
export const getTodayHRActivities = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const activities = await HRActivity.find({
      timestamp: { $gte: startOfDay },
    })
      .sort({ timestamp: -1 })
      .populate('hrId', 'name email');

    const activeHRs = await HRActivity.find({
      timestamp: { $gte: startOfDay },
      status: 'active',
    }).distinct('hrId');

    res.status(200).json({
      success: true,
      data: activities,
      statistics: {
        totalActivitiesLastDay: activities.length,
        activeHRsToday: activeHRs.length,
      },
    });
  } catch (error) {
    console.error('❌ Get Today HR Activities Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s activities',
      error: error.message,
    });
  }
};
