import axios from 'axios';

// Backend serves API routes at /api prefix
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Products API
export const productsApi = {
  getAll: (params?: any) => api.get('/products', { params }),
  getBySlug: (slug: string) => api.get(`/products/${slug}`),
  create: (data: FormData) => api.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id: string, data: FormData) => api.put(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Auth API
export const authApi = {
  sellerRegister: (data: any) => api.post('/auth/seller/register', data),
  sellerLogin: (data: any) => api.post('/auth/seller/login', data),
  sellerMe: () => api.get('/auth/seller/me'),
  adminLogin: (data: any) => api.post('/auth/admin/login', data),
  adminMe: () => api.get('/auth/admin/me'),
};

// Orders API
export const ordersApi = {
  create: (data: any) => api.post('/orders', data),
  getById: (id: string) => api.get(`/orders/${id}`),
  track: (orderNumber: string, email?: string, phone?: string) => 
    api.get(`/orders/track/${orderNumber}`, { params: { email, phone } }),
};

// Payments API
export const paymentsApi = {
  createOrder: (data: any) => api.post('/payments/create-order', data),
  verifyPayment: (data: any) => api.post('/payments/verify-payment', data),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
};

// Seller API
export const sellerApi = {
  getProducts: (params?: any) => api.get('/seller/products', { params }),
  getDashboard: () => api.get('/seller/dashboard'),
};

// Admin API
export const adminApi = {
  getProducts: (params?: any) => api.get('/admin/products', { params }),
  approveProduct: (id: string) => api.post(`/admin/products/${id}/approve`),
  rejectProduct: (id: string) => api.post(`/admin/products/${id}/reject`),
  getSellers: (params?: any) => api.get('/admin/sellers', { params }),
  toggleSellerStatus: (id: string) => api.post(`/admin/sellers/${id}/toggle-status`),
  getOrders: (params?: any) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id: string, status: string) => 
    api.put(`/admin/orders/${id}/status`, { order_status: status }),
  getDashboard: () => api.get('/admin/dashboard'),
};

export default api;

