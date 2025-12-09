// Request Management Service for HRMS
import axios from 'axios';

const API_URL = '/api/inquiry';

// Get authentication token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('authToken');
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

// ==================== INQUIRY MANAGEMENT APIs ====================

/**
 * 1. Get All Manual Inquiries
 * GET /api/inquiry/all
 * Returns all inquiries with sorting by creation date
 */
export const getAllInquiries = async () => {
  try {
    const response = await axiosInstance.get('/all');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching all inquiries:', error);
    throw error.response?.data || { message: 'Failed to fetch inquiries' };
  }
};

/**
 * 2. Create New Manual Inquiry
 * POST /api/inquiry/create
 * Creates a new inquiry with provided data
 */
export const createInquiry = async (inquiryData) => {
  try {
    const response = await axiosInstance.post('/create', inquiryData);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating inquiry:', error);
    throw error.response?.data || { message: 'Failed to create inquiry' };
  }
};

/**
 * 3. Get Inquiry By ID
 * GET /api/inquiry/:id
 * Returns single inquiry details
 */
export const getInquiryById = async (id) => {
  try {
    const response = await axiosInstance.get(`/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching inquiry ${id}:`, error);
    throw error.response?.data || { message: 'Failed to fetch inquiry details' };
  }
};

/**
 * 4. Update Inquiry
 * PUT /api/inquiry/update/:id
 * Updates inquiry details (status, comments, etc.)
 */
export const updateInquiry = async (id, updateData) => {
  try {
    const response = await axiosInstance.put(`/update/${id}`, updateData);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error updating inquiry ${id}:`, error);
    throw error.response?.data || { message: 'Failed to update inquiry' };
  }
};

/**
 * 5. Delete Inquiry
 * DELETE /api/inquiry/delete/:id
 * Deletes inquiry by ID
 */
export const deleteInquiry = async (id) => {
  try {
    const response = await axiosInstance.delete(`/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting inquiry ${id}:`, error);
    throw error.response?.data || { message: 'Failed to delete inquiry' };
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get Inquiries with Filters (Optional - Advanced)
 * GET /api/inquiry/get-enquiries?status=New&buyerId=xxx
 */
export const getEnquiriesWithFilters = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await axiosInstance.get(`/get-enquiries?${queryParams}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching filtered enquiries:', error);
    throw error.response?.data || { message: 'Failed to fetch filtered enquiries' };
  }
};

/**
 * Export all services as default object
 */
const inquiryService = {
  getAllInquiries,
  createInquiry,
  getInquiryById,
  updateInquiry,
  deleteInquiry,
  getEnquiriesWithFilters,
};

export default inquiryService;
