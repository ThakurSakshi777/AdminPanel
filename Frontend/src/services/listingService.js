// Listing Management Service for Admin Panel
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

// ==================== LISTINGS PAGE APIs ====================

/**
 * 1. Get All Property Listings
 * GET /api/properties/all
 * @returns {Promise} - Returns list of all property listings with status
 */
export const getAllListings = async () => {
  try {
    const response = await axiosInstance.get('/properties/all');
    return response.data;
  } catch (error) {
    console.error('Get all listings error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * 2. Approve Property Listing (Mark as Active/Sold)
 * PATCH /api/add/:id/mark-sold
 * @param {string} propertyId - Property ID to approve/mark as sold
 * @returns {Promise} - Returns updated property
 */
export const approvePropertyListing = async (propertyId) => {
  try {
    const response = await axiosInstance.patch(`/add/${propertyId}/mark-sold`);
    return response.data;
  } catch (error) {
    console.error('Approve property listing error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * 3. Update Property Status (Approve/Reject/Active/Pending)
 * PUT /api/add/edit/:id
 * @param {string} propertyId - Property ID
 * @param {string} status - New status (Active, Pending, Rejected, Sold)
 * @returns {Promise} - Returns updated property
 */
export const updatePropertyStatus = async (propertyId, status) => {
  try {
    const response = await axiosInstance.put(`/add/edit/${propertyId}`, {
      status: status
    });
    return response.data;
  } catch (error) {
    console.error('Update property status error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * 4. Delete Property Listing
 * DELETE /api/add/delete/:id
 * @param {string} propertyId - Property ID to delete
 * @returns {Promise} - Returns success message
 */
export const deletePropertyListing = async (propertyId) => {
  try {
    const response = await axiosInstance.delete(`/add/delete/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Delete property listing error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * 5. Get Listings by Status (Optional - for filtering)
 * GET /api/properties/all (then filter on frontend)
 * @param {string} status - Status to filter (Active, Pending, Rejected)
 * @returns {Promise} - Returns filtered listings
 */
export const getListingsByStatus = async (status) => {
  try {
    const response = await axiosInstance.get('/properties/all');
    // Filter by status on frontend
    const filteredListings = response.data.properties?.filter(
      property => property.status?.toLowerCase() === status.toLowerCase()
    );
    return {
      ...response.data,
      properties: filteredListings
    };
  } catch (error) {
    console.error('Get listings by status error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * 6. Search Listings
 * GET /api/properties/all (then search on frontend)
 * @param {string} searchTerm - Search term for property name or agent
 * @returns {Promise} - Returns search results
 */
export const searchListings = async (searchTerm) => {
  try {
    const response = await axiosInstance.get('/properties/all');
    // Search on frontend
    const searchResults = response.data.properties?.filter(property =>
      property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.propertyLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return {
      ...response.data,
      properties: searchResults
    };
  } catch (error) {
    console.error('Search listings error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export default {
  getAllListings,
  approvePropertyListing,
  updatePropertyStatus,
  deletePropertyListing,
  getListingsByStatus,
  searchListings
};
