import axios from 'axios';

// Determine API URL based on environment
const BASE_URL = import.meta.env.PROD 
  ? 'https://tekflox-social.vercel.app/api'  // Production: Vercel backend
  : 'http://localhost:3002/api';  // Development: local mock server (porta 3002)

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const getMessageUpdates = async (conversationId, since) => {
  const { data } = await api.get(`/conversations/${conversationId}/messages/updates`, {
    params: { since: since?.toISOString() }
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
