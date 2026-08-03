import api from './axios';

// ── Orders ────────────────────────────────────────────────────────────────────
export const getOrders    = ()          => api.get('/admin/orders');
export const getOrder     = (id)        => api.get(`/admin/orders/${id}`);
export const updateStatus = (id, status)=> api.patch(`/admin/orders/${id}/status`, { status });
export const setLocation  = (id, loc)   => api.patch(`/admin/orders/${id}/location`, { artistLocation: loc });
export const sendMessage  = (id, msg)   => api.post(`/admin/orders/${id}/messages`, { message: msg });

// Proof upload uses FormData (multipart), so Content-Type header is overridden
export const uploadProof = (id, file) => {
  const fd = new FormData();
  fd.append('proofImage', file);
  return api.post(`/admin/orders/${id}/proof`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ── Customers (for Clients page) ──────────────────────────────────────────────
export const getCustomers = () => api.get('/customers');

// Admin profile and settings
export const getProfile          = ()     => api.get('/admin/me');
export const updateProfile       = (data) => api.patch('/admin/profile', data);
export const updateBusiness      = (data) => api.patch('/admin/business', data);
export const updateNotifications = (data) => api.patch('/admin/notifications', data);
export const changePassword      = (data) => api.patch('/admin/password', data);

// Pricing configuration
export const getPricing     = ()         => api.get('/admin/pricing');
export const updatePriceRow = (id, data) => api.patch(`/admin/pricing/${id}`, data);
export const calculatePrice = (options)  => api.post('/admin/pricing/calculate', options);

export const getGalleryImages = () => api.get('/content/admin/gallery');
export const saveGalleryImage = (id, data) => api.patch(`/content/admin/gallery/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const addGalleryImage = (data) => api.post('/content/admin/gallery', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const removeGalleryImage = (id) => api.delete(`/content/admin/gallery/${id}`);
