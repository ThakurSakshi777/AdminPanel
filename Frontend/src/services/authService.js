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
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: userData.name,
        email: userData.email,
        mobileNumber: userData.phone || '',
        password: userData.password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Save admin data to localStorage (API doesn't return token on signup)
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
    console.error('Register error:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (credentials) => {
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
    }

    return data;
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

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userPhone');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  const isAuth = localStorage.getItem('isAuthenticated');
  return !!token || isAuth === 'true';
};
