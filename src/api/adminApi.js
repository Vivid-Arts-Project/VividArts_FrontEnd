import api from './axios';

const sharedReads = new Map();
const sharedGet = (url, ttlMs = 1_000) => {
  const now = Date.now();
  const cached = sharedReads.get(url);
  if (cached && (cached.pending || now - cached.createdAt < ttlMs)) return cached.promise;
  const entry = { createdAt: now, pending: true };
  entry.promise = api.get(url)
    .catch(error => {
      window.dispatchEvent(new CustomEvent('vividarts:data-request-error', { detail: {
        message: navigator.onLine ? 'Unable to refresh data from the server.' : 'You are offline. Reconnect and try again.',
        retry: () => { sharedReads.delete(url); return sharedGet(url, 0); },
      } }));
      throw error;
    })
    .finally(() => { entry.pending = false; });
  sharedReads.set(url, entry);
  return entry.promise;
};

const invalidateOrders = () => {
  for (const key of sharedReads.keys()) if (key.startsWith('/admin/orders')) sharedReads.delete(key);
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const getOrders    = (page = 1, limit = 50) => sharedGet(`/admin/orders?page=${page}&limit=${limit}`);
export const getOrder     = (id)        => sharedGet(`/admin/orders/${id}`, 500);
export const updateStatus = async (id, status) => { const result = await api.patch(`/admin/orders/${id}/status`, { status }); invalidateOrders(); return result; };
export const setLocation  = async (id, loc) => { const result = await api.patch(`/admin/orders/${id}/location`, { artistLocation: loc }); invalidateOrders(); return result; };
export const sendMessage  = async (id, msg) => { const result = await api.post(`/admin/orders/${id}/messages`, { message: msg }); invalidateOrders(); return result; };
export const deleteOrder  = async (id, reason = '') => { const result = await api.delete(`/admin/orders/${id}`, { data: { reason } }); invalidateOrders(); return result; };
export const referencePhotoDownloadUrl = (id, index) => `${api.defaults.baseURL}/admin/orders/${encodeURIComponent(id)}/reference-photos/${index}/download`;

// Proof upload uses FormData (multipart), so Content-Type header is overridden
export const uploadProof = (id, file) => {
  const fd = new FormData();
  fd.append('proofImage', file);
  return api.post(`/admin/orders/${id}/proof`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ── Customers (for Clients page) ──────────────────────────────────────────────
export const getCustomers = (page = 1, limit = 50) => sharedGet(`/admin/customers?page=${page}&limit=${limit}`);
export const getPayments  = (page = 1, limit = 50) => sharedGet(`/payments?page=${page}&limit=${limit}`);
export const invoiceUrl   = (payhereOrderId) => `${api.defaults.baseURL}/payments/${encodeURIComponent(payhereOrderId)}/invoice`;

// Admin profile and settings
export const getProfile          = ()     => api.get('/admin/me');
export const updateProfile       = (data) => api.patch('/admin/profile', data);
export const uploadAdminProfileImage = (file) => {
  const data = new FormData();
  data.append('profileImage', file);
  return api.patch('/admin/profile/image', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
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

// Admin activity notifications
export const getAdminNotifications = (page = 1, limit = 50) => sharedGet(`/admin/activity-notifications?page=${page}&limit=${limit}`);
export const markAdminNotificationRead = (id) => api.patch(`/admin/activity-notifications/${id}/read`);
export const markAllAdminNotificationsRead = () => api.patch('/admin/activity-notifications/read-all');
export const deleteAdminNotification = (id) => api.delete(`/admin/activity-notifications/${id}`);
