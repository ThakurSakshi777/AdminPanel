// API base URL - using proxy in development to avoid CORS
const API_URL = '/api';

// Helper function to get token from localStorage
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to get headers with token
const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Register new user
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: getHeaders(),
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
      headers: getHeaders(),
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

// Verify token
export const verifyToken = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/verify-token`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ token })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Token verification failed');
    }

    // Update user data in localStorage
    if (data.user) {
      localStorage.setItem('userName', data.user.fullName || data.user.name);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userRole', data.user.role);
    }

    return data;
  } catch (error) {
    console.error('Verify token error:', error);
    // Clear invalid token
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    throw error;
  }
};

// Get current user
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
  localStorage.removeItem('userAddress');
  localStorage.removeItem('userCompany');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};
