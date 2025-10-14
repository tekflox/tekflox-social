import { useState, useEffect, useRef } from 'react';
import { Search, Filter, Phone, Video, MoreVertical, Send, Paperclip, Smile, Info, ShoppingBag, User, Package, CheckCheck, Clock, MessageSquare, LayoutDashboard, Settings, ChevronRight, ChevronLeft, Tag, StickyNote, Sparkles, Check, LogOut, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import MessageBubble from '../components/MessageBubble';
import OrderSearchBox from '../components/OrderSearchBox';
import ReactMarkdown from 'react-markdown';

export default function Conversations() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { state, dispatch, selectConversation, sendMessage, handleMessageUpdates } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Função para formatar data/hora com "Hoje", "Ontem", ou dd/MM/yyyy
  const formatDateTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const timeStr = format(date, 'HH:mm', { locale: ptBR });
      
      if (isToday(date)) {
        return `Hoje ${timeStr}`;
      } else if (isYesterday(date)) {
        return `Ontem ${timeStr}`;
      } else {
        const dateStr = format(date, 'dd/MM/yyyy', { locale: ptBR });
        return `${dateStr} ${timeStr}`;
      }
    } catch {
      return '';
    }
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  const [messageText, setMessageText] = useState('');
  const [showOrderSearch, setShowOrderSearch] = useState(false);
  const [showCustomerPanel, setShowCustomerPanel] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null); // 'accept', 'edit', 'manual'
  const [editedText, setEditedText] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['whatsapp', 'instagram', 'facebook']); // Todas selecionadas por padrão
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  
  // NOTE: Polling global agora é gerenciado pelo GlobalPollingProvider
  // Não precisamos mais de polling individual por conversa
  // Todas as atualizações (mensagens + conversas) vêm do endpoint /updates
  
  // States for sidebar functionality
  const [aiSummary, setAiSummary] = useState(null); // Resumo pinado (gerado automaticamente)
  const [aiChat, setAiChat] = useState([]); // Histórico de conversa usuário <-> IA
  const [aiInsightInput, setAiInsightInput] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false); // Loading do resumo
  const [isLoadingChat, setIsLoadingChat] = useState(false); // Loading do chat
  const [manualNotes, setManualNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  
  const aiInsightsEndRef = useRef(null);
  
  const messagesEndRef = useRef(null);
  const aiSuggestionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAISuggestion = () => {
    aiSuggestionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    // Add small delay to ensure DOM is fully rendered (images, etc)
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [state.conversationMessages]);
  
  // Listen for new message arrived event (from polling)
  useEffect(() => {
    const handleNewMessage = () => {
      console.log('[Conversations] 📨 New message arrived - scrolling to bottom');
      // Small delay to ensure DOM updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    };
    
    window.addEventListener('tekflox-new-message-arrived', handleNewMessage);
    
    return () => {
      window.removeEventListener('tekflox-new-message-arrived', handleNewMessage);
    };
  }, []);

  // Auto-scroll AI Chat when new message arrives
  useEffect(() => {
    if (aiChat.length > 0) {
      console.log('[Conversations] 💬 AI Chat updated - scrolling to bottom');
      setTimeout(() => {
        aiInsightsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [aiChat]);

  useEffect(() => {
    if (state.selectedConversation) {
      // Limpar AI Insights ao trocar de conversa (evita confusão)
      console.log('[Conversations] 🧹 Limpando AI Insights ao trocar de conversa');
      setAiSummary(null);
      setAiChat([]);
      
      loadAISuggestion();
      loadConversationMetadata();
      
      // Scroll to bottom when conversation is first opened
      // Longer delay to ensure all messages are rendered
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    }
  }, [state.selectedConversation]);

  // Scroll to AI suggestion when it loads
  useEffect(() => {
    if (aiSuggestion) {
      console.log('[Conversations] 🤖 Scrolling to AI suggestion');
      // Delay to ensure DOM is rendered
      setTimeout(() => {
        scrollToAISuggestion();
      }, 200);
    }
  }, [aiSuggestion]);

  // Cleanup: Reset insights state when user navigates away from Conversations
  // This forces fresh generation when they come back
  useEffect(() => {
    return () => {
      console.log('[Conversations] 🧹 Component unmounting - clearing AI insights cache');
      // Call backend to clear cached insights for all conversations
      api.clearAIInsightsCache().catch(err => {
        console.warn('[Conversations] Failed to clear insights cache:', err);
      });
    };
  }, []);

  // Load conversation metadata (notes, tags, AI insights)
  const loadConversationMetadata = async () => {
    if (!state.selectedConversation) return;
    
    try {
      const response = await api.getConversationMetadata(state.selectedConversation.id);
      
      // Check if response is valid - silently skip if not (avoids unnecessary console warnings)
      if (!response) {
        console.log('[Conversations] ⚠️ No response from metadata API');
        return;
      }
      
      console.log('[Conversations] 📋 Metadata response:', response);
      
      // IMPORTANTE: aiInsights contém APENAS mensagens de CHAT (user <-> ai diálogo)
      // Resumo deve ser gerado separadamente via /ai/insights/:id
      const chatMessages = response.aiInsights || [];
      let summary = null;  // Será gerado abaixo
      
      console.log('[Conversations] 📊 Summary: null (será gerado)');
      console.log('[Conversations] 💬 Chat messages:', chatMessages.length);
      
      // SEMPRE gerar resumo automático (não está no metadata)
      setIsLoadingSummary(true);
      try {
        console.log('[Conversations] 🤖 Generating AI summary...');
        const summaryResponse = await api.generateAIInsights(state.selectedConversation.id);
        
        console.log('[Conversations] Summary response:', summaryResponse);
        
        if (summaryResponse && summaryResponse.success && summaryResponse.text) {
          summary = {
            sender: 'ai',
            text: summaryResponse.text,
            timestamp: summaryResponse.timestamp || new Date(),
            type: 'summary'
          };
          console.log('[Conversations] ✅ AI summary generated');
        } else {
          // Se backend retornar erro (ex: "No messages found")
          console.log('[Conversations] ⚠️ Backend não conseguiu gerar resumo');
          summary = null;
        }
      } catch (summaryError) {
        console.error('[Conversations] Error generating AI summary:', summaryError);
        // Fallback to simple summary
        summary = {
          sender: 'ai',
          text: generateInitialAISummary(),
          timestamp: new Date(),
          type: 'summary'
        };
      } finally {
        setIsLoadingSummary(false);
      }
      
      setAiSummary(summary);
      setAiChat(chatMessages);
      setManualNotes(response.manualNotes || '');
      setTags(response.tags || []);
    } catch (error) {
      // Silent fail on 401 - session expired modal will handle it
      if (error?.response?.status === 401) {
        return;
      }
      // Only log real errors (not 401)
      console.error('[Conversations] Error loading conversation metadata:', error);
    }
  };

  // Generate initial AI summary based on conversation context
  const generateInitialAISummary = () => {
    if (!state.selectedConversation) return 'Olá! Como posso ajudar com esta conversa?';
    
    const conv = state.selectedConversation;
    const platform = conv.platform === 'instagram' ? 'Instagram' : 
                     conv.platform === 'facebook' ? 'Facebook' : 'WhatsApp';
    
    let summary = `📊 Resumo da conversa:\n\n`;
    summary += `👤 Cliente: ${conv.contact.name}\n`;
    summary += `📱 Plataforma: ${platform}\n`;
    summary += `📝 Status: ${conv.status === 'pending' ? 'Pendente' : conv.status === 'answered' ? 'Respondida' : 'Resolvida'}\n\n`;
    
    if (conv.summary) {
      summary += `💬 Contexto: ${conv.summary}\n\n`;
    }
    
    if (conv.linkedCustomer) {
      summary += `✅ Cliente vinculado ao WooCommerce\n`;
      summary += `📦 Pedidos: ${conv.linkedCustomer.recentOrders?.length || 0}\n\n`;
    }
    
    summary += `Como posso te ajudar com esta conversa?`;
    
    return summary;
  };

  // Send message to AI Insights chat
  const sendAIInsightMessage = async () => {
    if (!aiInsightInput.trim()) return;
    
    try {
      const userMessage = {
        sender: 'user',
        text: aiInsightInput,
        timestamp: new Date()
      };
      
      // Add user message immediately to chat (optimistic UI)
      const updatedChat = [...aiChat, userMessage];
      setAiChat(updatedChat);
      setAiInsightInput('');
      
      // Show loading state
      setIsLoadingChat(true);
      
      // Call backend AI chat endpoint
      console.log('[Conversations] 🤖 Sending message to AI...');
      const response = await api.chatWithAI(state.selectedConversation.id, aiInsightInput);
      
      // Add AI response
      const aiResponse = {
        sender: 'ai',
        text: response.message || 'Desculpe, não consegui processar sua pergunta.',
        timestamp: response.timestamp || new Date()
      };
      
      updatedChat.push(aiResponse);
      
      // Note: Chat messages are automatically saved to DB by backend
      setAiChat(updatedChat);
      setIsLoadingChat(false);
      
      // Scroll to bottom of AI chat
      setTimeout(() => {
        aiInsightsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('[Conversations] Error sending AI chat message:', error);
      setIsLoadingChat(false);
      
      // Show error message
      const errorMessage = {
        sender: 'ai',
        text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      };
      setAiInsights([...aiInsights, errorMessage]);
    }
  };

  // Save Manual Notes (inline editing)
  const saveManualNotes = async (notes) => {
    try {
      await api.updateConversationMetadata(state.selectedConversation.id, { manualNotes: notes });
      setManualNotes(notes);
    } catch (error) {
      console.error('Error saving manual notes:', error);
    }
  };

  // Link Order to Conversation
  const handleLinkOrder = async (order) => {
    if (!state.selectedConversation) return;
    
    try {
      console.log('Linking order to conversation:', order);
      
      // Buscar dados completos do cliente
      const customer = await api.getCustomer(order.customerId);
      
      // Buscar pedidos recentes do cliente
      const customerOrders = await api.getCustomerOrders(order.customerId);
      
      // Montar objeto do cliente vinculado
      const linkedCustomer = {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        avatar: customer.avatar,
        recentOrders: customerOrders.map(o => ({
          id: o.id,
          number: o.orderNumber,
          total: o.total,
          status: o.status,
          date: o.date,
          items: o.items
        }))
      };
      
      // Atualizar conversa com cliente vinculado
      const updatedConversation = {
        ...state.selectedConversation,
        linkedCustomer,
        customerId: customer.id,
        orderId: order.id
      };
      
      // Atualizar no backend (se houver endpoint)
      // await api.updateConversation(state.selectedConversation.id, { customerId: customer.id, orderId: order.id });
      
      // Atualizar no contexto
      selectConversation(updatedConversation);
      
      // Fechar busca
      setShowOrderSearch(false);
      
      console.log('Order linked successfully:', linkedCustomer);
    } catch (error) {
      console.error('Error linking order:', error);
      alert('Erro ao vincular pedido. Tente novamente.');
    }
  };

  // Add Tag
  const addTag = async () => {
    if (!newTag.trim()) return;
    
    try {
      const updatedTags = [...tags, newTag.trim()];
      await api.updateConversationMetadata(state.selectedConversation.id, { tags: updatedTags });
      setTags(updatedTags);
      setNewTag('');
      setShowAddTag(false);
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  // Remove Tag
  const removeTag = async (tagToRemove) => {
    try {
      const updatedTags = tags.filter(t => t !== tagToRemove);
      await api.updateConversationMetadata(state.selectedConversation.id, { tags: updatedTags });
      setTags(updatedTags);
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };

  // Random tag color
  const getRandomLabelColor = () => {
    const colors = ['green', 'blue', 'red', 'yellow', 'purple', 'pink', 'indigo'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const loadAISuggestion = async () => {
    if (!state.selectedConversation) return;
    try {
      const suggestion = await api.getAISuggestion(state.selectedConversation.id);
      
      // Check if suggestion is valid - silently skip if not (avoids unnecessary console warnings)
      if (!suggestion || !suggestion.suggestion) {
        return;
      }
      
      setAiSuggestion(suggestion);
      setEditedText(suggestion.suggestion);
    } catch (error) {
      // Silent fail on 401 - session expired modal will handle it
      if (error?.response?.status === 401) {
        return;
      }
      // Only log real errors (not 401)
      console.error('[Conversations] Failed to load AI suggestion:', error);
    }
  };

  const handleSelectConversation = async (conversation) => {
    await selectConversation(conversation);
    setSelectedMode(null);
    setAiSuggestion(null);
  };

  const handleSendMessage = async (text, actionType = 'manual') => {
    if (!state.selectedConversation || !text.trim()) return;
    
    // Generate temporary ID for optimistic update
    const tempId = `temp_${Date.now()}`;
    const now = new Date();
    
    // Create optimistic message
    const optimisticMessage = {
      id: tempId,
      sender: 'agent',
      text: text.trim(),
      timestamp: now.toISOString(),
      actionType: actionType,
      attachments: [],
      isEdited: false,
      status: 'sending', // Estado inicial: relógio
      deliveryStatus: null,
      _isOptimistic: true // Flag para identificar mensagem otimista
    };
    
    // Add message immediately to UI
    dispatch({
      type: 'ADD_OPTIMISTIC_MESSAGE',
      payload: {
        conversationId: state.selectedConversation.id,
        message: optimisticMessage
      }
    });
    
    // Clear input immediately
    setMessageText('');
    setSelectedMode(null);
    setAiSuggestion(null);
    
    // Scroll to bottom
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    
    try {
      // Send to server using API service
      const response = await api.sendMessage(state.selectedConversation.id, {
        text: text,
        actionType: actionType
      });
      
      // Update optimistic message with server response (adiciona status 'read')
      dispatch({
        type: 'UPDATE_OPTIMISTIC_MESSAGE',
        payload: {
          conversationId: state.selectedConversation.id,
          tempId: tempId,
          message: {
            ...response,
            status: 'read' // Mensagem confirmada pelo servidor: tick duplo
          }
        }
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Mark message as failed
      dispatch({
        type: 'UPDATE_OPTIMISTIC_MESSAGE',
        payload: {
          conversationId: state.selectedConversation.id,
          tempId: tempId,
          message: {
            ...optimisticMessage,
            status: 'failed',
            error: true
          }
        }
      });
    }
  };

  const handleAcceptAI = () => {
    handleSendMessage(aiSuggestion.suggestion, 'ai_accepted');
  };

  const handleEditAI = () => {
    setSelectedMode('edit');
  };

  const handleManualMode = () => {
    setSelectedMode('manual');
    setMessageText('');
  };

  const handleSendEdited = () => {
    handleSendMessage(editedText, 'ai_edited');
  };

  const handleSendManual = () => {
    handleSendMessage(messageText, 'manual');
  };

  // Toggle platform filter
  const togglePlatform = (platform) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platform)) {
        return prev.filter(p => p !== platform);
      } else {
        return [...prev, platform];
      }
    });
  };

  // Filter conversations based on search and selected platforms
  const filteredConversations = state.conversations.filter(conv => {
    const matchesSearch = conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.contact.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlatform = selectedPlatforms.length === 0 || selectedPlatforms.includes(conv.platform);
    
    return matchesSearch && matchesPlatform;
  });

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'whatsapp': return 'bg-green-100 text-green-700';
      case 'instagram': return 'bg-pink-100 text-pink-700';
      case 'facebook': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'whatsapp': return '💬';
      case 'instagram': return '📷';
      case 'facebook': return '👥';
      default: return '💬';
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* VS Code Style Navigation Sidebar */}
      <div className={`${sidebarExpanded ? 'w-48' : 'w-16'} bg-gray-900 flex flex-col items-center py-4 transition-all duration-300`}>
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg mb-6 transition-colors"
        >
          {sidebarExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {/* Navigation Items */}
        <div className="flex flex-col space-y-2 w-full px-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 px-3 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Dashboard"
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {sidebarExpanded && <span className="text-sm">Dashboard</span>}
          </button>

          <button
            className="flex items-center space-x-3 px-3 py-3 text-white bg-gray-800 rounded-lg"
            title="Conversas"
          >
            <MessageSquare className="w-5 h-5 flex-shrink-0" />
            {sidebarExpanded && <span className="text-sm">Conversas</span>}
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="flex items-center space-x-3 px-3 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Configurações"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarExpanded && <span className="text-sm">Configurações</span>}
          </button>
        </div>

        {/* User Info & Logout (bottom) */}
        <div className="mt-auto w-full px-2 space-y-2">
          {/* User info */}
          {sidebarExpanded && user && (
            <div className="px-3 py-2 text-gray-400 text-xs border-t border-gray-800 pt-4">
              <p className="font-semibold text-white truncate">{user.name}</p>
              <p className="truncate">{user.email}</p>
              <p className="text-gray-500 mt-1">{user.role === 'admin' ? 'Administrador' : 'Agente'}</p>
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors text-gray-400 hover:text-red-400 hover:bg-gray-800 w-full"
            title="Sair"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarExpanded && <span className="text-sm">Sair</span>}
          </button>
        </div>
      </div>

      {/* Left Sidebar - Conversation List */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Conversas</h1>
          
          {/* Platform Filters - Moved to top */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <button
              onClick={() => setSelectedPlatforms(['whatsapp', 'instagram', 'facebook'])}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedPlatforms.length === 3
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            {['whatsapp', 'instagram', 'facebook'].map(platform => (
              <button
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedPlatforms.includes(platform)
                    ? getPlatformColor(platform)
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getPlatformIcon(platform)} {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-gray-200"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation)}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                state.selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                    {conversation.contact?.name?.charAt(0) || '?'}
                  </div>
                  {conversation.status === 'pending' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conversation.contact?.name || 'Desconhecido'}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(conversation.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getPlatformColor(conversation.platform)}`}>
                      {getPlatformIcon(conversation.platform)}
                    </span>
                    <p className="text-sm text-gray-600 truncate flex-1">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center - Message Thread */}
      <div className="flex-1 flex flex-col bg-white">
        {state.selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                  {state.selectedConversation.contact?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {state.selectedConversation.contact?.name || 'Desconhecido'}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getPlatformColor(state.selectedConversation.platform)}`}>
                      {getPlatformIcon(state.selectedConversation.platform)} {state.selectedConversation.platform}
                    </span>
                    {state.selectedConversation.linkedCustomer && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        🔗 Cliente vinculado
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button 
                  onClick={() => setShowCustomerPanel(!showCustomerPanel)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Info className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {state.conversationMessages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {/* AI Suggestion Card - Floating */}
              {aiSuggestion && !selectedMode && state.selectedConversation.status === 'pending' && (
                <div className="flex justify-center my-4">
                  <div ref={aiSuggestionRef} className="max-w-2xl w-full bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-6 space-y-4">
                    {/* AI Header */}
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white text-sm">✨</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Sugestão da IA</h3>
                        <p className="text-xs text-gray-500">
                          Tom: {aiSuggestion.tone} • {Math.round(aiSuggestion.confidence * 100)}% confiança
                        </p>
                      </div>
                    </div>

                    {/* Suggestion Text */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                      <p className="text-gray-800">{aiSuggestion.suggestion}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleAcceptAI}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                      >
                        <CheckCheck className="w-5 h-5" />
                        <span>Aceitar</span>
                      </button>
                      <button
                        onClick={handleEditAI}
                        className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={handleManualMode}
                        className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                      >
                        Manual
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Mode */}
              {selectedMode === 'edit' && (
                <div className="flex justify-center my-4">
                  <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">Editar Sugestão</h3>
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full p-4 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none resize-none"
                      rows="4"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedMode(null)}
                        className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSendEdited}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                      >
                        Enviar Editado
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4 bg-white">
              {selectedMode === 'manual' ? (
                <div className="space-y-3">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none"
                    rows="3"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedMode(null)}
                      className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSendManual}
                      disabled={!messageText.trim()}
                      className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <Send className="w-5 h-5" />
                      <span>Enviar Manual</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendManual()}
                    placeholder="Digite uma mensagem..."
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:bg-gray-200"
                  />
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Smile className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={handleSendManual}
                    disabled={!messageText.trim()}
                    className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-lg font-medium">Selecione uma conversa</p>
              <p className="text-sm">Escolha uma conversa da lista para começar</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Customer Info */}
      {showCustomerPanel && state.selectedConversation && (
        <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Customer Info Header */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold mb-3">
                {state.selectedConversation.contact?.name?.charAt(0) || '?'}
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {state.selectedConversation.contact?.name || 'Desconhecido'}
              </h2>
              <p className="text-sm text-gray-500">{state.selectedConversation.contact?.email || 'Email não disponível'}</p>
            </div>

            {/* Dados do Perfil */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-500" />
                  <span>Dados do Perfil</span>
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-gray-500 min-w-[80px]">Instagram:</span>
                  <span className="text-gray-900 font-medium">@{state.selectedConversation.contact.username}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <span>#</span>
                <span>Tags</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200 flex items-center space-x-1 group"
                  >
                    <span>#{tag}</span>
                    <button 
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {showAddTag ? (
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Nova tag"
                      className="px-2 py-1 text-xs border border-blue-300 rounded-full focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <button onClick={addTag} className="text-green-600 text-xs">✓</button>
                    <button onClick={() => { setShowAddTag(false); setNewTag(''); }} className="text-red-600 text-xs">×</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowAddTag(true)}
                    className="px-3 py-1 border-2 border-dashed border-gray-300 text-gray-500 text-xs rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    + Adicionar
                  </button>
                )}
              </div>
            </div>

            {/* Notes - Notas Manuais (inline editing) */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <StickyNote className="w-5 h-5 text-purple-500" />
                <span>Notas</span>
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                {isEditingNotes || !manualNotes ? (
                  <div className="space-y-2">
                    <textarea
                      value={manualNotes}
                      onChange={(e) => setManualNotes(e.target.value)}
                      onBlur={() => {
                        setIsEditingNotes(false);
                        saveManualNotes(manualNotes);
                      }}
                      placeholder="Adicione suas notas aqui..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
                      rows={4}
                      autoFocus
                    />
                  </div>
                ) : (
                  <div onClick={() => setIsEditingNotes(true)} className="cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{manualNotes}</p>
                    <p className="text-xs text-gray-400 mt-2">Clique para editar</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Search / Link Button */}
            {!state.selectedConversation.linkedCustomer && (
              <div className="space-y-3">
                {!showOrderSearch ? (
                  <button
                    onClick={() => setShowOrderSearch(true)}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Vincular Cliente/Pedido</span>
                  </button>
                ) : (
                  <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <ShoppingBag className="w-4 h-4 text-purple-600" />
                      <span>Buscar Pedido</span>
                    </h3>
                    <OrderSearchBox
                      onSelectOrder={handleLinkOrder}
                      onClose={() => setShowOrderSearch(false)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Customer Details - Only if linked */}
            {state.selectedConversation.linkedCustomer && (
              <>
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <User className="w-5 h-5 text-purple-500" />
                    <span>Cliente WooCommerce</span>
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                    <p className="font-medium text-gray-900">{state.selectedConversation.linkedCustomer.name}</p>
                    <p className="text-sm text-gray-600">{state.selectedConversation.linkedCustomer.email}</p>
                    <p className="text-sm text-gray-600">ID: #{state.selectedConversation.linkedCustomer.id}</p>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <ShoppingBag className="w-5 h-5 text-purple-500" />
                    <span>Pedidos Recentes</span>
                  </h3>
                  <div className="space-y-2">
                    {state.selectedConversation.linkedCustomer.recentOrders?.map((order) => (
                      <div key={order.id} className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Pedido #{order.number}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          R$ {order.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Products */}
                {state.selectedConversation.linkedCustomer.recentOrders?.[0]?.items && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <Package className="w-5 h-5 text-purple-500" />
                      <span>Produtos do Último Pedido</span>
                    </h3>
                    <div className="space-y-2">
                      {state.selectedConversation.linkedCustomer.recentOrders[0].items.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded-xl p-3 flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-600">Qtd: {item.quantity} • R$ {item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* AI Chat - Diálogo com IA */}
            <div className="space-y-3 pt-4 border-t-2 border-purple-200">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                <span>Chat com IA</span>
                {isLoadingChat && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
                )}
              </h3>
              
              {/* Resumo da Conversa (compacto, entre título e chat) */}
              {isLoadingSummary ? (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-xs text-gray-600">Gerando resumo...</span>
                  </div>
                </div>
              ) : aiSummary ? (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <FileText className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-700 leading-relaxed prose prose-xs max-w-none
                        prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1
                        prose-h3:text-sm prose-h3:mt-2
                        prose-p:my-1 prose-p:text-xs
                        prose-ul:my-1 prose-ul:pl-4 prose-ul:text-xs
                        prose-ol:my-1 prose-ol:pl-4 prose-ol:text-xs
                        prose-li:my-0.5
                        prose-strong:text-gray-800 prose-strong:font-semibold
                        prose-code:text-purple-600 prose-code:bg-white prose-code:px-1 prose-code:rounded prose-code:text-xs
                        prose-blockquote:border-l-2 prose-blockquote:border-blue-400 prose-blockquote:pl-2 prose-blockquote:italic prose-blockquote:text-gray-600
                      ">
                        <ReactMarkdown>{aiSummary.text}</ReactMarkdown>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Resumo • {formatDateTime(aiSummary.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
              
              {/* Chat Messages */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 max-h-80 overflow-y-auto">
                {aiChat.length === 0 ? (
                  <div className="text-sm text-gray-500 italic text-center py-8">
                    Faça perguntas sobre a conversa para a IA...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiChat.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-xl px-3 py-2 ${
                            message.sender === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-800 border border-purple-200'
                          }`}
                        >
                          {message.sender === 'ai' && (
                            <div className="flex items-center space-x-1 mb-1">
                              <Sparkles className="w-3 h-3 text-purple-500" />
                              <span className="text-xs font-medium text-purple-600">IA</span>
                            </div>
                          )}
                          {message.sender === 'ai' ? (
                            <div className="text-sm leading-relaxed prose prose-sm max-w-none
                              prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:mt-2 prose-headings:mb-1
                              prose-h3:text-sm
                              prose-p:my-1 prose-p:text-sm
                              prose-ul:my-1 prose-ul:pl-4 prose-ul:text-sm
                              prose-ol:my-1 prose-ol:pl-4 prose-ol:text-sm
                              prose-li:my-0.5
                              prose-strong:text-gray-900 prose-strong:font-semibold
                              prose-code:text-purple-700 prose-code:bg-purple-50 prose-code:px-1 prose-code:rounded prose-code:text-xs
                              prose-blockquote:border-l-2 prose-blockquote:border-purple-400 prose-blockquote:pl-2 prose-blockquote:italic
                            ">
                              <ReactMarkdown>{message.text}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                          )}
                          <p className="text-xs opacity-70 mt-1">
                            {formatDateTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isLoadingChat && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-purple-200 rounded-xl px-3 py-2">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
                            <span className="text-sm text-gray-600">Pensando...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={aiInsightsEndRef} />
                  </div>
                )}
              </div>

              {/* Input para chat com IA */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={aiInsightInput}
                  onChange={(e) => setAiInsightInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendAIInsightMessage()}
                  placeholder="Pergunte algo à IA sobre esta conversa..."
                  className="flex-1 px-3 py-2 text-sm border border-purple-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={sendAIInsightMessage}
                  disabled={isLoadingChat || !aiInsightInput.trim()}
                  className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
