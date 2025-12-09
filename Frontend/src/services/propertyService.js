// Employee Data Management Service for HRMS
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

// ==================== ADMIN PANEL - PROPERTY MANAGEMENT APIs ====================

/**
 * 1. Get All Properties
 * GET /api/properties/all
 * @returns {Promise} - Returns list of all properties
 */
export const getAllProperties = async () => {
  try {
    const response = await axiosInstance.get('/properties/all');
    return response.data;
  } catch (error) {
    console.error('Get all properties error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * 2. Add New Property
 * POST /api/add/add
 * @param {FormData} propertyData - Property data with images (max 10 files)
 * @returns {Promise} - Returns created property data
 */
export const addProperty = async (propertyData) => {
  try {
    const formData = new FormData();
    
    // Add all property fields
    Object.keys(propertyData).forEach(key => {
      if (key === 'photosAndVideo' && propertyData[key]) {
        // Handle file uploads
        Array.from(propertyData[key]).forEach(file => {
          formData.append('photosAndVideo', file);
        });
      } else if (propertyData[key] !== null && propertyData[key] !== undefined) {
        formData.append(key, propertyData[key]);
      }
    });

    const response = await axiosInstance.post('/add/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Add property error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * 3. Update Property
 * PUT /api/add/edit/:id
 * @param {string} propertyId - Property ID to update
 * @param {FormData} propertyData - Updated property data with images
 * @returns {Promise} - Returns updated property data
 */
export const updateProperty = async (propertyId, propertyData) => {
  try {
    const formData = new FormData();
    
    // Add all property fields
    Object.keys(propertyData).forEach(key => {
      if (key === 'photosAndVideo' && propertyData[key]) {
        // Handle file uploads
        Array.from(propertyData[key]).forEach(file => {
          formData.append('photosAndVideo', file);
        });
      } else if (propertyData[key] !== null && propertyData[key] !== undefined) {
        formData.append(key, propertyData[key]);
      }
    });

    const response = await axiosInstance.put(`/add/edit/${propertyId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Update property error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * 4. Delete Property
 * DELETE /api/add/delete/:id
 * @param {string} propertyId - Property ID to delete
 * @returns {Promise} - Returns success message
 */
export const deleteProperty = async (propertyId) => {
  try {
    const response = await axiosInstance.delete(`/add/delete/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Delete property error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// ==================== OPTIONAL - ADDITIONAL APIs ====================

/**
 * 5. Mark Property as Sold
 * PATCH /api/add/:id/mark-sold
 * @param {string} propertyId - Property ID to mark as sold
 * @returns {Promise} - Returns updated property
 */
export const markPropertyAsSold = async (propertyId) => {
  try {
    const response = await axiosInstance.patch(`/add/${propertyId}/mark-sold`);
    return response.data;
  } catch (error) {
    console.error('Mark property as sold error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * 6. Get Properties by Category
 * GET /api/properties/category/:category
 * @param {string} category - Category name (Apartment, Villa, etc.)
 * @returns {Promise} - Returns filtered properties
 */
export const getPropertiesByCategory = async (category) => {
  try {
    const response = await axiosInstance.get(`/properties/category/${category}`);
    return response.data;
  } catch (error) {
    console.error('Get properties by category error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * 7. Get Property Statistics
 * GET /api/properties/sub-category-counts
 * @returns {Promise} - Returns property counts by category
 */
export const getPropertyStats = async () => {
  try {
    const response = await axiosInstance.get('/properties/sub-category-counts');
    return response.data;
  } catch (error) {
    console.error('Get property stats error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export default {
  getAllProperties,
  addProperty,
  updateProperty,
  deleteProperty,
  markPropertyAsSold,
  getPropertiesByCategory,
  getPropertyStats
};
