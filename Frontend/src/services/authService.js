// API base URL - using proxy in development to avoid CORS
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

// Register new user (SignUp)
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        password: userData.password,
        role: userData.role || 'employee' // Include role
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Save user data to localStorage
    if (data.data?.token || data.token) {
      const token = data.data?.token || data.token || '';
      const userRole = userData.role || 'employee';
      const user = data.data || {};
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userName', user.name || userData.name || '');
      localStorage.setItem('userEmail', user.email || userData.email);
      localStorage.setItem('userId', user._id || user.id || '');
      localStorage.setItem('userRole', userRole);
      
      if (user.phone) {
        localStorage.setItem('userPhone', user.phone);
      }
    }

    // Return user data and token for AuthContext
    return {
      token: data.data?.token || data.token || '',
      user: data.data || { 
        email: userData.email,
        name: userData.name,
        role: userData.role || 'employee'
      },
      message: data.message
    };
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
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

    // Save token and user data to localStorage
    if (data.data?.token || data.token) {
      const token = data.data?.token || data.token;
      const user = data.data || {};
      // IMPORTANT: Use the role from the backend (user.role), NOT from frontend selection
      const userRole = user.role || 'employee';
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userName', user.name || '');
      localStorage.setItem('userEmail', user.email || credentials.email);
      localStorage.setItem('userId', user._id || user.id || '');
      localStorage.setItem('userRole', userRole);
      
      if (user.phone) {
        localStorage.setItem('userPhone', user.phone);
      }
    }

    // Return user data and token for AuthContext
    return {
      token: data.data?.token || data.token || '',
      user: data.data || { 
        email: credentials.email,
        name: '',
        role: credentials.role || 'employee'
      },
      message: data.message
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Forgot Password - Send OTP
export const forgotPassword = async (email) => {
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
    console.error('Forgot password error:', error);
    throw error;
  }
};

// Verify OTP
export const verifyOTP = async (email, otp) => {
  try {
    const response = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Invalid OTP');
    }

    return data;
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
};

// Reset Password
export const resetPassword = async (email, newPassword) => {
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
    console.error('Reset password error:', error);
    throw error;
  }
};

// Get current user (if backend provides this endpoint)
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user data');
    }

    return data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

// Track HR Logout
export const trackHRLogout = async (sessionId, token) => {
  try {
    if (!sessionId || !token) {
      console.warn('⚠️ Session ID or token missing for logout tracking');
      return;
    }

    const response = await fetch(`${API_URL}/hr-activity/track-logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ sessionId })
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ HR Logout tracked:', data);
    }
  } catch (error) {
    console.warn('⚠️ HR logout tracking failed:', error);
    // Don't fail logout if tracking fails
  }
};

// Logout user
export const logoutUser = async () => {
  // Track HR logout if user is HR
  try {
    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('authToken');
    const sessionId = localStorage.getItem('sessionId');

    if (userRole === 'hr' && token && sessionId) {
      await trackHRLogout(sessionId, token);
    }
  } catch (error) {
    console.warn('⚠️ Error tracking HR logout:', error);
  }

  // Clear all localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userPhone');
  localStorage.removeItem('sessionId');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  const isAuth = localStorage.getItem('isAuthenticated');
  return !!token || isAuth === 'true';
};
