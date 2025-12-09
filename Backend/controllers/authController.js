import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h',
  });
};

// @desc    Register new user (Sign Up)
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { name, email, password, role, department, position, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'employee',
      department: department || '',
      position: position || '',
      phone: phone || '',
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
          department: user.department,
          position: user.position,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data',
      });
    }
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for email:', email);

    // Validation
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check if user exists (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    console.log('✓ User found:', user.email);
    console.log('✓ User has password hash:', !!user.password);
    console.log('✓ User is active:', user.isActive);

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ User account is inactive');
      return res.status(401).json({
        success: false,
        message: 'Your account is inactive. Please contact HR.',
      });
    }

    // Check password
    console.log('🔍 Comparing passwords...');
    const isPasswordMatch = await user.comparePassword(password);
    console.log('🔍 Password match result:', isPasswordMatch);

    if (!isPasswordMatch) {
      console.log('❌ Password does not match');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    console.log('✅ Login successful for user:', user.email);

    // Generate token and send response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        position: user.position,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        position: user.position,
        phone: user.phone,
        joinDate: user.joinDate,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message,
    });
  }
};

// @desc    Logout user (Clear token on client side)
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during logout',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, position } = req.body;
    
    console.log('📝 Updating profile for user:', req.user.email);
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (position) user.position = position;
    
    await user.save();
    
    console.log('✅ Profile updated successfully');
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        position: user.position,
        phone: user.phone,
        joinDate: user.joinDate,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('❌ Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    console.log('🔒 Changing password for user:', req.user.email);
    console.log('📊 User ID:', req.user._id);
    console.log('📊 Request Body Keys:', Object.keys(req.body));
    
    // Validate input
    if (!currentPassword || !newPassword) {
      console.log('❌ Missing passwords in request');
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password',
      });
    }
    
    if (newPassword.length < 4) {
      console.log('❌ New password too short');
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 4 characters',
      });
    }
    
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    console.log('✓ User found:', user.email);
    console.log('✓ User has password hash:', !!user.password);
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      console.log('❌ Current password is incorrect');
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }
    
    console.log('✓ Current password verified');
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    console.log('✅ Password changed successfully for user:', user.email);
    console.log('✅ New password hash saved');
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('❌ Change Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message,
    });
  }
};
