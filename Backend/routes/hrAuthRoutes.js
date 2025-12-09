import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Verify Token Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// ============================================
// HR SIGNUP - PUBLIC ROUTE (NO TOKEN REQUIRED)
// ============================================
router.post('/signup', async (req, res) => {
  try {
    const {
      name,
      fullName,
      email,
      phone,
      alternatePhone,
      password,
      designation,
      department,
      hrLevel,
      officeLocation,
      reportingTo,
    } = req.body;

    // Use fullName if provided, otherwise use name
    const userName = fullName || name;

    // Validation
    if (!userName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided (name, email, phone, password)',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create new HR user
    const newUser = await User.create({
      name: userName,
      email,
      phone,
      password: hashedPassword,
      role: 'hr',
      isActive: true,
      department: department || 'Human Resources',
    });

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('❌ JWT_SECRET not found in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error - JWT_SECRET not set',
      });
    }

    const token = jwt.sign(
      { id: newUser._id.toString(), role: 'hr', email: newUser.email },
      secret,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'HR registration successful! You can now login with your credentials.',
      token,
      hr: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        department: newUser.department,
      },
    });
  } catch (error) {
    console.error('❌ HR Signup Error:', error.message || error);
    res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: error.message,
    });
  }
});

// ============================================
// HR LOGIN - PUBLIC ROUTE (NO TOKEN REQUIRED)
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user with role 'hr' - MUST SELECT PASSWORD since model has select: false
    const user = await User.findOne({ email, role: 'hr' }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // HR accounts don't require approval since HR is admin role
    // But check if they are active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your HR account has been deactivated. Please contact system administrator.',
      });
    }

    // Verify password - password field must exist
    if (!user.password) {
      console.error('❌ Password field missing for user:', email);
      return res.status(500).json({
        success: false,
        message: 'Server error - user data corrupted',
      });
    }

    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('❌ JWT_SECRET not found in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error - JWT_SECRET not set',
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: 'hr', email: user.email },
      secret,
      { expiresIn: '24h' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'HR login successful',
      token,
      hr: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
      },
    });
  } catch (error) {
    console.error('❌ HR Login Error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name,
    });
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// ============================================
// PROTECTED ROUTES (REQUIRE TOKEN)
// ============================================

// Get pending HR registrations (Admin only)
// Returns inactive HRs that might need review
router.get('/pending', verifyToken, async (req, res) => {
  try {
    const pendingHRs = await User.find({ role: 'hr', isActive: false });
    res.status(200).json({
      success: true,
      data: pendingHRs,
      count: pendingHRs.length,
    });
  } catch (error) {
    console.error('Error fetching pending HRs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// Get approved HRs (Admin only)
// Returns all active HRs
router.get('/approved', verifyToken, async (req, res) => {
  try {
    const approvedHRs = await User.find({ role: 'hr', isActive: true });
    res.status(200).json({
      success: true,
      data: approvedHRs,
      count: approvedHRs.length,
    });
  } catch (error) {
    console.error('Error fetching approved HRs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// Approve HR registration (Admin only)
// Activate a deactivated HR account
router.post('/approve/:hrId', verifyToken, async (req, res) => {
  try {
    const hr = await User.findByIdAndUpdate(
      req.params.hrId,
      { isActive: true },
      { new: true }
    );

    if (!hr) {
      return res.status(404).json({
        success: false,
        message: 'HR not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'HR account activated successfully',
      data: hr,
    });
  } catch (error) {
    console.error('Error approving HR:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// Reject HR registration (Admin only)
// Deactivate an HR account instead of deleting
router.post('/reject/:hrId', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;

    const hr = await User.findByIdAndUpdate(
      req.params.hrId,
      { isActive: false },
      { new: true }
    );

    if (!hr) {
      return res.status(404).json({
        success: false,
        message: 'HR not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'HR account deactivated',
      data: hr,
    });
  } catch (error) {
    console.error('Error rejecting HR:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

export default router;
