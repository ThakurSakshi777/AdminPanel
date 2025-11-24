// User Authentication Service - Complete API Integration
const API_URL = '/auth';

// Helper function to get token from localStorage
const getToken = () => {
  return localStorage.getItem('userToken');
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

// ==================== User Authentication APIs ====================

// 1. Send Phone OTP
export const sendPhoneOtp = async (phone) => {
  try {
    const response = await fetch(`${API_URL}/send-phone-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }

    return data;
  } catch (error) {
    console.error('Send phone OTP error:', error);
    throw error;
  }
};

// 2. Verify Phone OTP
export const verifyPhoneOtp = async (phone, otp) => {
  try {
    const response = await fetch(`${API_URL}/verify-phone-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'OTP verification failed');
    }

    // Save token and user data if OTP verified
    if (data.token) {
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('isUserAuthenticated', 'true');
      
      if (data.user) {
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('userName', data.user.fullName);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userPhone', data.user.phone);
      }
    }

    return data;
  } catch (error) {
    console.error('Verify phone OTP error:', error);
    throw error;
  }
};

// 3. User Signup
export const signupUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        state: userData.state,
        city: userData.city,
        street: userData.street,
        pinCode: userData.pinCode,
        password: userData.password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    // Save user data
    if (data.user) {
      localStorage.setItem('isUserAuthenticated', 'true');
      localStorage.setItem('userId', data.user._id);
      localStorage.setItem('userName', data.user.fullName);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userPhone', data.user.phone);
    }

    return data;
  } catch (error) {
    console.error('User signup error:', error);
    throw error;
  }
};

// 4. User Login
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Save token and user data
    if (data.token) {
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('isUserAuthenticated', 'true');
      
      if (data.user) {
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userName', data.user.fullName);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userPhone', data.user.phone);
        localStorage.setItem('userJoinDate', data.user.date);
        localStorage.setItem('userLastLogin', data.user.lastLogin);
      }
    }

    return data;
  } catch (error) {
    console.error('User login error:', error);
    throw error;
  }
};

// 5. Google Login
export const googleLogin = async (idToken) => {
  try {
    const response = await fetch(`${API_URL}/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Google login failed');
    }

    // Save token and user data
    if (data.token) {
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('isUserAuthenticated', 'true');
      
      if (data.user) {
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userEmail', data.user.email);
      }
    }

    return data;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

// ==================== Helper Functions ====================

// Logout User
export const logoutUser = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('isUserAuthenticated');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userPhone');
  localStorage.removeItem('userJoinDate');
  localStorage.removeItem('userLastLogin');
};

// Check if user is authenticated
export const isUserAuthenticated = () => {
  const token = getToken();
  const isAuth = localStorage.getItem('isUserAuthenticated');
  return !!token || isAuth === 'true';
};

// Get current user info from localStorage
export const getCurrentUserInfo = () => {
  return {
    id: localStorage.getItem('userId'),
    name: localStorage.getItem('userName'),
    email: localStorage.getItem('userEmail'),
    phone: localStorage.getItem('userPhone'),
    joinDate: localStorage.getItem('userJoinDate'),
    lastLogin: localStorage.getItem('userLastLogin')
  };
};
