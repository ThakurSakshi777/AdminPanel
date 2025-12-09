import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('🔐 TOKEN FOUND - Length:', token?.length);

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔓 TOKEN VERIFIED - User ID:', decoded.id);

      // Get user from token (excluding password)
      req.user = await User.findById(decoded.id).select('-password');
      console.log('👤 USER LOADED - Name:', req.user?.name, 'Role:', req.user?.role);

      if (!req.user) {
        console.log('❌ USER NOT FOUND');
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      if (!req.user.isActive) {
        console.log('❌ USER INACTIVE');
        return res.status(401).json({
          success: false,
          message: 'User account is inactive',
        });
      }

      next();
    } catch (error) {
      console.error('❌ TOKEN VERIFICATION ERROR:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  }

  if (!token) {
    console.log('❌ NO TOKEN PROVIDED');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }
};

// Role-based access control
export const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role?.toLowerCase();
    const normalizedRoles = roles.map(r => r.toLowerCase());
    console.log('=== AUTHORIZATION CHECK ===');
    console.log('User:', req.user?.email || 'No user');
    console.log('User Role:', req.user?.role, '→ Lowercase:', userRole);
    console.log('Required Roles:', roles, '→ Normalized:', normalizedRoles);
    console.log('Authorization Pass:', normalizedRoles.includes(userRole));
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found in request. Authentication failed.',
      });
    }
    
    if (!normalizedRoles.includes(userRole)) {
      console.log('❌ AUTHORIZATION FAILED');
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to access this route. Required: ${roles.join(', ')}`,
      });
    }
    console.log('✅ AUTHORIZATION PASSED');
    next();
  };
};
