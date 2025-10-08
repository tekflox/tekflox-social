import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

const AppContext = createContext();

const initialState = {
  // User
  user: {
    name: 'Admin User',
    email: 'admin@tekflox.com',
    avatar: 'https://i.pravatar.cc/150?img=20',
  },
  
  // Conversations
  conversations: [],
  selectedConversation: null,
  conversationMessages: [],
  loading: false,
  error: null,
  
  // Filters
  selectedPlatforms: ['instagram', 'facebook', 'whatsapp'],
  statusFilter: null, // null, 'pending', 'answered', 'resolved'
  
  // Pending dashboard
  pendingConversations: [],
  
  // AI
  aiSettings: {
    autoSuggestions: true,
    suggestionTone: 'friendly',
    autoSummary: true,
  },
  
  // Settings
  settings: null,
  
  // Stats
  dashboardStats: null,
  actionChoicesStats: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
      
    // Conversations
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload, loading: false };
      
    case 'SET_SELECTED_CONVERSATION':
      return { ...state, selectedConversation: action.payload };
      
    case 'SET_CONVERSATION_MESSAGES':
      return { ...state, conversationMessages: action.payload };
      
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversationMessages: [...state.conversationMessages, action.payload],
      };
      
    case 'UPDATE_MESSAGE_STATUS':
      return {
        ...state,
        conversationMessages: state.conversationMessages.map(msg =>
          msg.id === action.payload.messageId 
            ? { ...msg, status: action.payload.status } 
            : msg
        ),
      };
      
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id ? { ...conv, ...action.payload } : conv
        ),
      };
      
    // Pending
    case 'SET_PENDING_CONVERSATIONS':
      return { ...state, pendingConversations: action.payload, loading: false };
      
    // Filters
    case 'SET_PLATFORM_FILTER':
      return { ...state, selectedPlatforms: action.payload };
      
    case 'TOGGLE_PLATFORM':
      const platforms = state.selectedPlatforms.includes(action.payload)
        ? state.selectedPlatforms.filter(p => p !== action.payload)
        : [...state.selectedPlatforms, action.payload];
      return { ...state, selectedPlatforms: platforms };
      
    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.payload };
      
    // Settings
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
      
    case 'UPDATE_AI_SETTINGS':
      return {
        ...state,
        aiSettings: { ...state.aiSettings, ...action.payload },
      };
      
    // Stats
    case 'SET_DASHBOARD_STATS':
      return { ...state, dashboardStats: action.payload };
      
    case 'SET_ACTION_CHOICES_STATS':
      return { ...state, actionChoicesStats: action.payload };
      
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Load initial data (only when authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardStats();
      loadSettings();
    }
  }, [isAuthenticated]);
  
  // Load conversations when filters change (only when authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated, state.selectedPlatforms, state.statusFilter]);
  
  // Listen for conversations-updated event from polling
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const handleConversationsUpdated = () => {
      console.log('[AppContext] 📥 Recebendo evento de atualização de conversas');
      loadConversations();
    };
    
    window.addEventListener('conversations-updated', handleConversationsUpdated);
    
    return () => {
      window.removeEventListener('conversations-updated', handleConversationsUpdated);
    };
  }, [isAuthenticated, state.selectedPlatforms, state.statusFilter]);
  
  // ==================== Actions ====================
  
  const loadConversations = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const filters = {};
      if (state.selectedPlatforms.length > 0 && state.selectedPlatforms.length < 3) {
        filters.platform = state.selectedPlatforms[0];
      }
      if (state.statusFilter) {
        filters.status = state.statusFilter;
      }
      const conversations = await api.getConversations(filters);
      dispatch({ type: 'SET_CONVERSATIONS', payload: conversations });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };
  
  const loadPendingConversations = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const pending = await api.getPendingWithSuggestions();
      dispatch({ type: 'SET_PENDING_CONVERSATIONS', payload: pending });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };
  
  const selectConversation = async (conversation) => {
    try {
      dispatch({ type: 'SET_SELECTED_CONVERSATION', payload: conversation });
      const messages = await api.getMessages(conversation.id);
      dispatch({ type: 'SET_CONVERSATION_MESSAGES', payload: messages });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };
  
  const sendMessage = async (conversationId, text, actionType = 'manual') => {
    try {
      const message = await api.sendMessage(conversationId, { text, actionType });
      dispatch({ type: 'ADD_MESSAGE', payload: message });
      
      // Update conversation in list
      const updatedConv = await api.getConversation(conversationId);
      dispatch({ type: 'UPDATE_CONVERSATION', payload: updatedConv });
      
      return message;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };
  
  const updateMessageStatus = (messageId, status) => {
    dispatch({ type: 'UPDATE_MESSAGE_STATUS', payload: { messageId, status } });
  };
  
  const handleMessageUpdates = useCallback((messages) => {
    messages.forEach(msg => {
      if (msg.status) {
        dispatch({
          type: 'UPDATE_MESSAGE_STATUS',
          payload: { messageId: msg.id, status: msg.status }
        });
      }
    });
  }, []); // No dependencies - uses dispatch which is stable
  
  const linkConversationToEntity = async (conversationId, linkData) => {
    try {
      const updated = await api.linkConversation(conversationId, linkData);
      dispatch({ type: 'UPDATE_CONVERSATION', payload: updated });
      if (state.selectedConversation?.id === conversationId) {
        dispatch({ type: 'SET_SELECTED_CONVERSATION', payload: updated });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };
  
  const loadDashboardStats = async () => {
    try {
      const stats = await api.getDashboardStats();
      dispatch({ type: 'SET_DASHBOARD_STATS', payload: stats });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  };
  
  const loadActionChoicesStats = async () => {
    try {
      const stats = await api.getActionChoicesAnalytics();
      dispatch({ type: 'SET_ACTION_CHOICES_STATS', payload: stats });
    } catch (error) {
      console.error('Failed to load action choices stats:', error);
    }
  };
  
  const loadSettings = async () => {
    try {
      const settings = await api.getSettings();
      dispatch({ type: 'SET_SETTINGS', payload: settings });
      dispatch({ type: 'UPDATE_AI_SETTINGS', payload: settings.ai });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };
  
  const updateSettings = async (updates) => {
    try {
      const settings = await api.updateSettings(updates);
      dispatch({ type: 'SET_SETTINGS', payload: settings });
      if (updates.ai) {
        dispatch({ type: 'UPDATE_AI_SETTINGS', payload: updates.ai });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };
  
  const togglePlatform = (platform) => {
    dispatch({ type: 'TOGGLE_PLATFORM', payload: platform });
  };
  
  const setStatusFilter = (status) => {
    dispatch({ type: 'SET_STATUS_FILTER', payload: status });
  };
  
  const value = {
    state,
    dispatch,
    // Actions
    loadConversations,
    loadPendingConversations,
    selectConversation,
    sendMessage,
    updateMessageStatus,
    handleMessageUpdates,
    linkConversationToEntity,
    loadDashboardStats,
    loadActionChoicesStats,
    loadSettings,
    updateSettings,
    togglePlatform,
    setStatusFilter,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
