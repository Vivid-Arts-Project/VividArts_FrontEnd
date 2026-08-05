import { getCustomerToken } from './authSession';

const API_URL = '/api';

// Helper function for API calls with error handling
const fetchAPI = async (url, options = {}) => {
  try {
    const token = getCustomerToken();
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const api = {
  // ==================== PAYMENT ENDPOINTS ====================
  
  // Create payment order
  createPaymentOrder: async (data) => {
    return fetchAPI(`${API_URL}/payments/create-order`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Create PayHere checkout payload
  createPayhereCheckout: async (data) => {
    return fetchAPI(`${API_URL}/payments/create-payhere-checkout`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Process payment
  processPayment: async (data) => {
    return fetchAPI(`${API_URL}/payments/process`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get payment status
  getPaymentStatus: async (orderId) => {
    return fetchAPI(`${API_URL}/payments/status/${encodeURIComponent(orderId)}`);
  },

  // Local PayHere sandbox fallback; the backend rejects this outside development.
  confirmSandboxReturn: async (orderId) => {
    return fetchAPI(`${API_URL}/payments/sandbox-confirm-return/${encodeURIComponent(orderId)}`, {
      method: 'POST',
    });
  },

  // Invoice PDF download URL (available once payment is completed)
  downloadInvoice: async (orderId) => {
    const token = getCustomerToken();
    const response = await fetch(`${API_URL}/payments/${encodeURIComponent(orderId)}/invoice`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      const error = contentType.includes('application/json') ? await response.json() : null;
      throw new Error(error?.error || `Unable to download invoice (${response.status})`);
    }
    return response.blob();
  },

  // Get prices
  getPrices: async () => {
    return fetchAPI(`${API_URL}/payments/prices`);
  },

  getQueuePosition: async () => {
    return fetchAPI(`${API_URL}/payments/queue-position`);
  },

  // Get all payments
  getAllPayments: async () => {
    return fetchAPI(`${API_URL}/payments`);
  },

  // Get the currently authenticated customer's profile
  getProfile: async (token) => {
    return fetchAPI(`${API_URL}/customers/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // ==================== HEALTH CHECK ====================

  // Check if server is running
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Server is not running:', error);
      return false;
    }
  },
};
