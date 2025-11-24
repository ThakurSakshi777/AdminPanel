import axios from 'axios';

const API_URL = '/api';

// Get authentication token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Set up axios instance with auth header
const axiosInstance = axios.create({
  baseURL: API_URL,
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

/**
 * Get all users
 * GET /api/users
 * @returns {Promise} - Returns list of all users with total count
 */
export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get('/users');
    return response.data;
  } catch (error) {
    console.error('Get all users error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Update user by ID
 * PUT /api/users/:id
 * @param {string} userId - User ID to update
 * @param {object} userData - User data to update (name, email, phone, etc.)
 * @returns {Promise} - Returns updated user data
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await axiosInstance.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Update user error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Delete user by ID
 * DELETE /api/users/:id
 * @param {string} userId - User ID to delete
 * @returns {Promise} - Returns success message
 */
export const deleteUser = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Delete user error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export default {
  getAllUsers,
  updateUser,
  deleteUser
};
