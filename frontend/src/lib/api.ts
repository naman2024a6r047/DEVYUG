const API_BASE_URL = typeof window !== 'undefined'
  ? (process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api' : '/api')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');


// Utility helper to construct headers with auth token if available
const getHeaders = (isJson = true) => {
  const headers: HeadersInit = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('dvyug_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Generic fetch wrapper
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getHeaders(!options.body || !(options.body instanceof FormData)),
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const api = {
  // --- AUTH SERVICES ---
  auth: {
    login: (body: { email: string; password?: string }) => 
      fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body: { name: string; email: string; password?: string; phone?: string; referredBy?: string }) => 
      fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    sendOtp: (body: { email: string; phone?: string; name?: string }) =>
      fetchAPI('/auth/otp-send', { method: 'POST', body: JSON.stringify(body) }),
    verifyOtp: (body: { email: string; otp: string }) =>
      fetchAPI('/auth/otp-verify', { method: 'POST', body: JSON.stringify(body) }),
  },

  // --- PRODUCT SERVICES ---
  products: {
    getAll: (params: { category?: string; minPrice?: string; maxPrice?: string; search?: string; sortBy?: string; page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params.category) query.append('category', params.category);
      if (params.minPrice) query.append('minPrice', params.minPrice);
      if (params.maxPrice) query.append('maxPrice', params.maxPrice);
      if (params.search) query.append('search', params.search);
      if (params.sortBy) query.append('sortBy', params.sortBy);
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      return fetchAPI(`/products?${query.toString()}`);
    },
    getFeatured: () => fetchAPI('/products/featured'),
    getBySlug: (slug: string) => fetchAPI(`/products/${slug}`),
    submitReview: (body: { productId: string; rating: number; comment: string }) =>
      fetchAPI('/products/review', { method: 'POST', body: JSON.stringify(body) }),
  },

  // --- BLOG SERVICES ---
  blogs: {
    getAll: (params: { category?: string; search?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.category) query.append('category', params.category);
      if (params.search) query.append('search', params.search);
      return fetchAPI(`/blogs?${query.toString()}`);
    },
    getBySlug: (slug: string) => fetchAPI(`/blogs/${slug}`),
    submitComment: (slug: string, body: { authorName: string; content: string }) =>
      fetchAPI(`/blogs/${slug}/comments`, { method: 'POST', body: JSON.stringify(body) }),
  },

  // --- CART SERVICES ---
  cart: {
    get: () => fetchAPI('/orders/cart'),
    add: (productId: string, quantity = 1) =>
      fetchAPI('/orders/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
    updateQty: (id: string, quantity: number) =>
      fetchAPI(`/orders/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
    remove: (id: string) => fetchAPI(`/orders/cart/${id}`, { method: 'DELETE' }),
  },

  // --- ORDER SERVICES ---
  orders: {
    getMyOrders: () => fetchAPI('/orders/my-orders'),
    checkout: (body: { items: { productId: string; quantity: number }[]; shippingAddress: string; paymentMethod: string; couponCode?: string; redeemPoints?: boolean }) =>
      fetchAPI('/orders/checkout', { method: 'POST', body: JSON.stringify(body) }),
    verifyPayment: (body: { orderId: string; paymentId: string; paymentStatus?: string }) =>
      fetchAPI('/orders/verify-payment', { method: 'POST', body: JSON.stringify(body) }),
  },

  // --- SUBSCRIPTION SERVICES ---
  subscriptions: {
    getPlans: () => fetchAPI('/subscriptions/plans'),
    getMy: () => fetchAPI('/subscriptions/my-subscriptions'),
    subscribe: (planId: string) =>
      fetchAPI('/subscriptions/subscribe', { method: 'POST', body: JSON.stringify({ planId }) }),
    updateStatus: (id: string, status: 'ACTIVE' | 'PAUSED' | 'CANCELLED') =>
      fetchAPI(`/subscriptions/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  },

  // --- AI RECOMMENDATION & CHAT SERVICES ---
  ai: {
    getRecommendations: (body: { age: string; lifestyle: string; goal: string; healthInterest: string[] }) =>
      fetchAPI('/ai/recommend', { method: 'POST', body: JSON.stringify(body) }),
    chat: (body: { message: string; history?: any[] }) =>
      fetchAPI('/ai/chat', { method: 'POST', body: JSON.stringify(body) }),
  },

  // --- ADMIN PORTAL SERVICES ---
  admin: {
    getAnalytics: () => fetchAPI('/admin/analytics'),
    getOrders: () => fetchAPI('/admin/orders'),
    updateOrderStatus: (id: string, status: string) =>
      fetchAPI(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    getCustomers: () => fetchAPI('/admin/customers'),
    addProduct: (body: any) =>
      fetchAPI('/admin/products', { method: 'POST', body: JSON.stringify(body) }),
    updateProduct: (id: string, body: any) =>
      fetchAPI(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteProduct: (id: string) =>
      fetchAPI(`/admin/products/${id}`, { method: 'DELETE' }),
    addBlog: (body: any) =>
      fetchAPI('/admin/blogs', { method: 'POST', body: JSON.stringify(body) }),
    updateBlog: (id: string, body: any) =>
      fetchAPI(`/admin/blogs/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteBlog: (id: string) =>
      fetchAPI(`/admin/blogs/${id}`, { method: 'DELETE' }),
  }

};
