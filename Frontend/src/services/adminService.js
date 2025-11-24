// Admin Service - Complete API Integration
const API_URL = '/api';

// Helper function to get token from localStorage
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to get headers with token
const getHeaders = () => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// ==================== Admin Authentication APIs ====================

// 1. Admin Signup/Register
export const registerAdmin = async (adminData) => {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: adminData.name,
        email: adminData.email,
        mobileNumber: adminData.phone,
        password: adminData.password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Save admin data to localStorage
    if (data.admin) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userName', data.admin.fullName);
      localStorage.setItem('userEmail', data.admin.email);
      localStorage.setItem('userId', data.admin.id);
      localStorage.setItem('userRole', 'Admin');
      if (data.admin.mobileNumber) {
        localStorage.setItem('userPhone', data.admin.mobileNumber);
      }
    }

    return data;
  } catch (error) {
    console.error('Register Admin error:', error);
    throw error;
  }
};

// 2. Admin Login
export const loginAdmin = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Save token and admin data to localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userName', data.admin?.fullName || '');
      localStorage.setItem('userEmail', data.admin?.email || credentials.email);
      localStorage.setItem('userId', data.admin?.id || '');
      localStorage.setItem('userRole', 'Admin');
      
      if (data.admin?.mobileNumber) {
        localStorage.setItem('userPhone', data.admin.mobileNumber);
      }
      
      if (data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId);
      }
    }

    return data;
  } catch (error) {
    console.error('Login Admin error:', error);
    throw error;
  }
};

// 3. Admin Change Password
export const changeAdminPassword = async (passwordData) => {
  try {
    const response = await fetch(`${API_URL}/admin-change-password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmNewPassword
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Password change failed');
    }

    return data;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

// 4. Send 2FA OTP
export const sendTwoFAOtp = async (email) => {
  try {
    const response = await fetch(`${API_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }

    return data;
  } catch (error) {
    console.error('Send 2FA OTP error:', error);
    throw error;
  }
};

// 5. Verify 2FA OTP
export const verifyTwoFAOtp = async (email, otp) => {
  try {
    const response = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'OTP verification failed');
    }

    return data;
  } catch (error) {
    console.error('Verify 2FA OTP error:', error);
    throw error;
  }
};

// 6. Enable 2FA
export const enableTwoFA = async () => {
  try {
    const response = await fetch(`${API_URL}/enableTwoFA`, {
      method: 'PUT',
      headers: getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to enable 2FA');
    }

    return data;
  } catch (error) {
    console.error('Enable 2FA error:', error);
    throw error;
  }
};

// 7. Disable 2FA
export const disableTwoFA = async () => {
  try {
    const response = await fetch(`${API_URL}/disableTwoFA`, {
      method: 'PUT',
      headers: getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to disable 2FA');
    }

    return data;
  } catch (error) {
    console.error('Disable 2FA error:', error);
    throw error;
  }
};

// 8. Get Active Sessions
export const getActiveSessions = async () => {
  try {
    const response = await fetch(`${API_URL}/sessions`, {
      method: 'GET',
      headers: getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch sessions');
    }

    return data;
  } catch (error) {
    console.error('Get active sessions error:', error);
    throw error;
  }
};

// 9. Logout from Specific Session
export const logoutSession = async (sessionId) => {
  try {
    const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to logout session');
    }

    return data;
  } catch (error) {
    console.error('Logout session error:', error);
    throw error;
  }
};

// 10. Admin Forgot Password (Send OTP)
export const adminForgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }

    return data;
  } catch (error) {
    console.error('Admin forgot password error:', error);
    throw error;
  }
};

// 11. Admin Verify OTP (for password reset)
export const adminVerifyOtp = async (email, otp) => {
  try {
    const response = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'OTP verification failed');
    }

    return data;
  } catch (error) {
    console.error('Admin verify OTP error:', error);
    throw error;
  }
};

// 12. Admin Reset Password
export const adminResetPassword = async (email, newPassword) => {
  try {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }

    return data;
  } catch (error) {
    console.error('Admin reset password error:', error);
    throw error;
  }
};

// ==================== Helper Functions ====================

// Logout Admin
export const logoutAdmin = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userPhone');
  localStorage.removeItem('sessionId');
};

// Check if admin is authenticated
export const isAdminAuthenticated = () => {
  const token = getToken();
  const isAuth = localStorage.getItem('isAuthenticated');
  return !!token || isAuth === 'true';
};

// Get current admin info from localStorage
export const getCurrentAdminInfo = () => {
  return {
    name: localStorage.getItem('userName'),
    email: localStorage.getItem('userEmail'),
    id: localStorage.getItem('userId'),
    role: localStorage.getItem('userRole'),
    phone: localStorage.getItem('userPhone')
  };
};
