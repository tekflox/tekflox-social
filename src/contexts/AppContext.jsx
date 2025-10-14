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
  
  // Conversations (now includes messages)
  conversations: [], // Each conversation has .messages array
  selectedConversation: null,
  conversationMessages: [],
  loading: false,
  error: null,
  lastMessageId: 0, // For incremental polling
  
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
      return { 
        ...state, 
        conversations: action.payload.conversations || action.payload, 
        lastMessageId: action.payload.last_message_id || state.lastMessageId,
        loading: false 
      };
      
    case 'MERGE_CONVERSATIONS':
      // Merge updated conversations from polling into existing array
      // Updated conversations have new messages that need to be merged
      const updatedConvs = action.payload.conversations || [];
      const updatedIds = new Set(updatedConvs.map(c => c.id));
      
      // Keep existing conversations that weren't updated, merge the ones that were
      const mergedConversations = state.conversations.map(existingConv => {
        if (updatedIds.has(existingConv.id)) {
          const updatedConv = updatedConvs.find(c => c.id === existingConv.id);
          // Merge messages: keep existing + add new ones
          const existingMsgIds = new Set(existingConv.messages?.map(m => m.id) || []);
          const newMessages = updatedConv.messages?.filter(m => !existingMsgIds.has(m.id)) || [];
          
          return {
            ...existingConv,
            ...updatedConv,
            messages: [...(existingConv.messages || []), ...newMessages]
          };
        }
        return existingConv;
      });
      
      // Add any completely new conversations (not in existing list)
      const existingIds = new Set(state.conversations.map(c => c.id));
      const newConvs = updatedConvs.filter(c => !existingIds.has(c.id));
      
      return {
        ...state,
        conversations: [...newConvs, ...mergedConversations].sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        ),
        lastMessageId: action.payload.last_message_id || state.lastMessageId
      };
      
    case 'SET_SELECTED_CONVERSATION':
      // When selecting conversation, get messages from conversations array
      const selectedConv = action.payload;
      const convMessages = selectedConv?.messages || [];
      return { 
        ...state, 
        selectedConversation: selectedConv,
        conversationMessages: convMessages
      };
      
    case 'SET_CONVERSATION_MESSAGES':
      return { ...state, conversationMessages: action.payload };
      
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversationMessages: [...state.conversationMessages, action.payload],
      };
      
    case 'ADD_OPTIMISTIC_MESSAGE':
      // Adiciona mensagem otimista imediatamente à UI
      return {
        ...state,
        conversationMessages: [...state.conversationMessages, action.payload.message],
      };
      
    case 'UPDATE_OPTIMISTIC_MESSAGE':
      // Substitui mensagem otimista pela mensagem real do servidor
      return {
        ...state,
        conversationMessages: state.conversationMessages.map(msg =>
          msg.id === action.payload.tempId 
            ? { ...action.payload.message, _wasOptimistic: true } 
            : msg
        ),
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
  
  // Global polling integration
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const handleGlobalUpdates = (event) => {
      const updates = event.detail;
      console.log('[AppContext] � Processing global updates:', updates);
      
      if (updates.hasUpdates && updates.conversations?.length > 0) {
        console.log('[AppContext] 🔄 Merging updated conversations:', updates.conversations.length);
        
        // Merge updated conversations into existing state
        dispatch({ 
          type: 'MERGE_CONVERSATIONS', 
          payload: { 
            conversations: updates.conversations,
            last_message_id: state.lastMessageId
          } 
        });
        
        // If selected conversation was updated, update its messages too
        if (state.selectedConversation) {
          const updatedSelectedConv = updates.conversations.find(c => c.id === state.selectedConversation.id);
          if (updatedSelectedConv) {
            console.log('[AppContext] 🔄 Updating messages for selected conversation:', state.selectedConversation.id);
            // Merge new messages into conversation messages
            const existingMsgIds = new Set(state.conversationMessages?.map(m => m.id) || []);
            const newMessages = updatedSelectedConv.messages?.filter(m => !existingMsgIds.has(m.id)) || [];
            
            if (newMessages.length > 0) {
              console.log('[AppContext] 📨 New messages arrived for selected conversation:', newMessages.length);
              dispatch({ 
                type: 'SET_CONVERSATION_MESSAGES', 
                payload: [...state.conversationMessages, ...newMessages] 
              });
              
              // Dispatch event to scroll to bottom (for Conversations.jsx)
              window.dispatchEvent(new CustomEvent('tekflox-new-message-arrived'));
            }
          }
        }
      }
    };
    
    window.addEventListener('tekflox-global-updates', handleGlobalUpdates);
    
    return () => {
      window.removeEventListener('tekflox-global-updates', handleGlobalUpdates);
    };
  }, [isAuthenticated, state.selectedConversation, state.conversationMessages, state.lastMessageId]);
  
  // ==================== Actions ====================
  
  const loadConversations = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const filters = {};
      
      // Platform filter
      if (state.selectedPlatforms.length > 0 && state.selectedPlatforms.length < 3) {
        filters.platform = state.selectedPlatforms[0];
      }
      
      // Status filter
      if (state.statusFilter) {
        filters.status = state.statusFilter;
      }
      
      // Incremental polling: only fetch NEW messages if we have lastMessageId
      if (state.lastMessageId > 0) {
        filters.last_message_id = state.lastMessageId;
      }
      
      console.log('[AppContext] 📥 Loading conversations with filters:', filters);
      const data = await api.getConversations(filters);
      
      // data = { conversations: [...], last_message_id: N }
      console.log(`[AppContext] ✅ Loaded ${data.conversations?.length || 0} conversations, lastMessageId: ${data.last_message_id}`);
      dispatch({ type: 'SET_CONVERSATIONS', payload: data });
    } catch (error) {
      console.error('[AppContext] ❌ Error loading conversations:', error);
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
      // INSTANTÂNEO: Conversa já tem messages no array
      console.log(`[AppContext] 🚀 Selected conversation ${conversation.id} with ${conversation.messages?.length || 0} messages`);
      dispatch({ type: 'SET_SELECTED_CONVERSATION', payload: conversation });
      
      // Nota: Não precisa mais fazer API call! Mensagens já vieram em /conversations
    } catch (error) {
      console.error('[AppContext] ❌ Error selecting conversation:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };
  
  const sendMessage = async (conversationId, text, actionType = 'manual') => {
    try {
      const message = await api.sendMessage(conversationId, { text, actionType });
      dispatch({ type: 'ADD_MESSAGE', payload: message });
      
      // Update conversation in list (will be refreshed by next poll)
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
