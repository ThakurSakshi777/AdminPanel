// HR Service Management APIs for HRMS
import axios from 'axios';

const API_URL = '/api/services';

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

// ==================== SERVICE MANAGEMENT APIs ====================

// 1. Get All Services
export const getAllServices = async () => {
  return await axiosInstance.get('/');
};

// 2. Add New Service
export const addService = async (serviceData) => {
  return await axiosInstance.post('/add', serviceData);
};

// 3. Update Service
export const updateService = async (id, serviceData) => {
  return await axiosInstance.put(`/update/${id}`, serviceData);
};

// 4. Delete Main Service
export const deleteMainService = async (mainServiceId) => {
  return await axiosInstance.delete(`/delete-main/${mainServiceId}`);
};

// 5. Delete Service Type
export const deleteServiceType = async (mainServiceId, typeId) => {
  return await axiosInstance.delete(`/delete-type/${mainServiceId}/${typeId}`);
};

// 6. Get All Service Requests (Admin)
export const getAllServiceRequests = async () => {
  return await axiosInstance.get('/all-services');
};

// 7. Delete Service Request by Admin
export const deleteServiceRequestByAdmin = async (requestId) => {
  return await axiosInstance.delete(`/admin/delete/${requestId}`);
};

// 8. Cancel Service Request by Admin
export const cancelServiceRequestByAdmin = async (requestId) => {
  return await axiosInstance.post(`/cancel/${requestId}`);
};

// 9. Mark Service Request as Completed
export const markServiceRequestCompleted = async (requestId) => {
  return await axiosInstance.post(`/complete/${requestId}`);
};
