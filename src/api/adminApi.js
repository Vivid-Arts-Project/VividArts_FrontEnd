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