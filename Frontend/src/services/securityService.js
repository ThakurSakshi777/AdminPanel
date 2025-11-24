// Security Management APIs for Admin Panel
import axios from 'axios';

// Get authentication token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('authToken');
};

// Set up axios instance with auth header
const axiosInstance = axios.create({
  baseURL: '/admin',
});

// Add token to request headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== SECURITY MANAGEMENT APIs ====================

// 1. Admin Change Password
export const changePassword = async (passwordData) => {
  return await axiosInstance.put('/admin-change-password', passwordData);
};

// Note: Other features (2FA, Session Management, Permissions) ke liye
// backend mein APIs available hain:
// - POST /admin/send-otp - Send 2FA OTP
// - POST /admin/verify-otp - Verify 2FA OTP
// - PUT /admin/enableTwoFA - Enable 2FA
// - PUT /admin/disableTwoFA - Disable 2FA
// - GET /admin/sessions - Get active sessions
// - DELETE /admin/sessions/:sessionId - Logout specific session
