const API_URL = 'http://localhost:3001/api';

// Helper function for API calls with error handling
const fetchAPI = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
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
    return fetchAPI(`${API_URL}/payments/status/${orderId}`);
  },

  // Local PayHere sandbox fallback; the backend rejects this outside development.
  confirmSandboxReturn: async (orderId) => {
    return fetchAPI(`${API_URL}/payments/sandbox-confirm-return/${orderId}`, {
      method: 'POST',
    });
  },

  // Invoice PDF download URL (available once payment is completed)
  getInvoiceUrl: (orderId) => `${API_URL}/payments/${orderId}/invoice`,

  // Get prices
  getPrices: async () => {
    return fetchAPI(`${API_URL}/payments/prices`);
  },

  // Get all payments
  getAllPayments: async () => {
    return fetchAPI(`${API_URL}/payments`);
  },

  // ==================== CUSTOMER ENDPOINTS ====================

  // Create customer
  createCustomer: async (customerData) => {
    return fetchAPI(`${API_URL}/customers`, {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  },

  // Get customer by ID
  getCustomer: async (customerId) => {
    return fetchAPI(`${API_URL}/customers/${customerId}`);
  },

  // Update customer
  updateCustomer: async (customerId, data) => {
    return fetchAPI(`${API_URL}/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get all customers
  getAllCustomers: async () => {
    return fetchAPI(`${API_URL}/customers`);
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
      const response = await fetch('http://localhost:3001/');
      return response.ok;
    } catch (error) {
      console.error('Server is not running:', error);
      return false;
    }
  },
};
