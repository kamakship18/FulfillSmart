// API client for communicating with FastAPI backend
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Upload and simulate Excel data
export const uploadAndSimulate = async (formData) => {
  try {
    console.log('Sending request to:', `${API_BASE_URL}/api/simulate`);
    const response = await api.post('/api/simulate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading and simulating:', error);
    
    if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
      throw new Error('Cannot connect to server. Please make sure the backend is running on http://localhost:8000');
    }
    
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.detail || error.response.data?.message || 'Server error occurred';
      throw new Error(errorMessage);
    }
    
    throw error;
  }
};

// Get summary data
export const getSummary = async () => {
  try {
    const response = await api.get('/api/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching summary:', error);
    throw error;
  }
};

// Get grouped summary data
export const getGroupedSummary = async () => {
  try {
    const response = await api.get('/api/grouped-summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching grouped summary:', error);
    throw error;
  }
};

// Get order details for specific city and type
export const getOrderDetails = async (city, orderType) => {
  try {
    const response = await api.get('/api/order-details', {
      params: { city, order_type: orderType }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

// Get insights data for analytics dashboard
export const getInsightsData = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.city && filters.city.length > 0) params.append('city', filters.city.join(','));
    if (filters.orderType && filters.orderType.length > 0) params.append('orderType', filters.orderType.join(','));
    if (filters.minVolume !== undefined) params.append('minVolume', filters.minVolume);
    if (filters.savingsThreshold !== undefined) params.append('savingsThreshold', filters.savingsThreshold);

    console.log('Making insights request to:', `${API_BASE_URL}/api/insights-data`);
    
    const response = await api.get(`/api/insights-data?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Insights API Error:', error);
    if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
      throw new Error('Cannot connect to the backend server. Please ensure the Python backend is running on the correct port.');
    }
    throw error;
  }
};

export default api;
