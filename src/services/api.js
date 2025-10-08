import axios from 'axios';

// Create axios instance without fixed baseURL (will be set dynamically)
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add dynamic baseURL and auth token
api.interceptors.request.use(
  (config) => {
    // Get base URL from localStorage (set during login)
    const baseURL = localStorage.getItem('baseURL') || 'http://localhost:3002';
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Set baseURL dynamically
    config.baseURL = `${baseURL}/api`;
    
    // Add auth token if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 (token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, clear auth and redirect to login
    if (error.response?.status === 401) {
      console.warn('[API] 401 Unauthorized - clearing auth and redirecting to login');
      
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login (only if not already there)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// =====================================================
// CONVERSATIONS
// =====================================================

export const getConversations = async (filters = {}) => {
  const { data } = await api.get('/conversations', { params: filters });
  return data;
};

export const getConversation = async (id) => {
  const { data } = await api.get(`/conversations/${id}`);
  return data;
};

export const updateConversation = async (id, updates) => {
  const { data } = await api.patch(`/conversations/${id}`, updates);
  return data;
};

export const linkConversation = async (id, linkData) => {
  const { data } = await api.post(`/conversations/${id}/link`, linkData);
  return data;
};

// Get conversation metadata (notes, tags, labels)
export const getConversationMetadata = async (id) => {
  const { data } = await api.get(`/conversations/${id}/metadata`);
  return data;
};

// Update conversation metadata
export const updateConversationMetadata = async (id, metadata) => {
  const { data } = await api.patch(`/conversations/${id}/metadata`, metadata);
  return data;
};

// =====================================================
// MESSAGES
// =====================================================

export const getMessages = async (conversationId) => {
  const { data } = await api.get(`/conversations/${conversationId}/messages`);
  return data;
};

export const sendMessage = async (conversationId, message) => {
  const { data } = await api.post(`/conversations/${conversationId}/messages`, message);
  return data;
};

export const updateMessageStatus = async (messageId, status) => {
  const { data } = await api.patch(`/messages/${messageId}/status`, { status });
  return data;
};

export const getMessageUpdates = async (conversationId, since, timeout = 15000, signal = null) => {
  const { data } = await api.get(`/conversations/${conversationId}/messages/updates`, {
    params: { 
      since: since?.toISOString(),
      timeout: timeout
    },
    signal: signal, // For aborting request
    timeout: timeout + 5000 // Axios timeout 5s maior que server timeout
  });
  return data;
};

// =====================================================
// AI
// =====================================================

export const getAISuggestion = async (conversationId) => {
  const { data } = await api.get(`/ai/suggestion/${conversationId}`);
  return data;
};

export const getAISummary = async (conversationId) => {
  const { data } = await api.get(`/ai/summary/${conversationId}`);
  return data;
};

export const getPendingWithSuggestions = async () => {
  const { data } = await api.get('/dashboard/pending');
  return data;
};

// =====================================================
// CUSTOMERS
// =====================================================

export const getCustomers = async () => {
  const { data } = await api.get('/customers');
  return data;
};

export const getCustomer = async (id) => {
  const { data } = await api.get(`/customers/${id}`);
  return data;
};

export const searchCustomers = async (query) => {
  const { data } = await api.get('/customers/search', { params: { q: query } });
  return data;
};

// =====================================================
// ORDERS
// =====================================================

export const getOrders = async () => {
  const { data } = await api.get('/orders');
  return data;
};

export const getOrder = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

export const getCustomerOrders = async (customerId) => {
  const { data } = await api.get(`/customers/${customerId}/orders`);
  return data;
};

export const searchOrders = async (query) => {
  const { data } = await api.get('/orders/search', { params: { q: query } });
  return data;
};

// Search orders for autocomplete (últimos 45 dias)
export const searchOrdersAutocomplete = async (query) => {
  const { data } = await api.get('/search/orders', { params: { q: query } });
  return data;
};

// =====================================================
// WORDPRESS ACCOUNTS
// =====================================================

export const getWordPressAccounts = async () => {
  const { data } = await api.get('/wordpress-accounts');
  return data;
};

export const getWordPressAccount = async (id) => {
  const { data } = await api.get(`/wordpress-accounts/${id}`);
  return data;
};

export const searchWordPressAccounts = async (query) => {
  const { data } = await api.get('/wordpress-accounts/search', { params: { q: query } });
  return data;
};

// =====================================================
// POSTS
// =====================================================

export const getPosts = async (filters = {}) => {
  const { data } = await api.get('/posts', { params: filters });
  return data;
};

export const getPost = async (id) => {
  const { data } = await api.get(`/posts/${id}`);
  return data;
};

// =====================================================
// ANALYTICS
// =====================================================

export const getActionChoicesAnalytics = async () => {
  const { data } = await api.get('/analytics/action-choices');
  return data;
};

export const getDashboardStats = async () => {
  const { data } = await api.get('/analytics/dashboard');
  return data;
};

// =====================================================
// SETTINGS
// =====================================================

export const getSettings = async () => {
  const { data } = await api.get('/settings');
  return data;
};

export const updateSettings = async (updates) => {
  const { data } = await api.patch('/settings', updates);
  return data;
};

// =====================================================
// HEALTH CHECK
// =====================================================

export const healthCheck = async () => {
  const { data } = await api.get('/health');
  return data;
};

export default {
  // Conversations
  getConversations,
  getConversation,
  updateConversation,
  linkConversation,
  
  // Messages
  getMessages,
  sendMessage,
  
  // AI
  getAISuggestion,
  getAISummary,
  getPendingWithSuggestions,
  
  // Customers
  getCustomers,
  getCustomer,
  searchCustomers,
  
  // Orders
  getOrders,
  getOrder,
  getCustomerOrders,
  searchOrders,
  
  // WordPress
  getWordPressAccounts,
  getWordPressAccount,
  searchWordPressAccounts,
  
  // Posts
  getPosts,
  getPost,
  
  // Analytics
  getActionChoicesAnalytics,
  getDashboardStats,
  
  // Settings
  getSettings,
  updateSettings,
  
  // Health
  healthCheck,
};
