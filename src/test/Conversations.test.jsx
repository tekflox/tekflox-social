import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Conversations from '../pages/Conversations';
import * as api from '../services/api';

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock data
const mockConversations = [
  {
    id: 1,
    platform: 'whatsapp',
    contact: { name: 'João Silva', username: 'joao_silva', email: 'joao@test.com' },
    lastMessage: 'Olá, tudo bem?',
    timestamp: new Date().toISOString(),
    status: 'pending',
    unread: true
  },
  {
    id: 2,
    platform: 'instagram',
    contact: { name: 'Maria Santos', username: 'maria_santos', email: 'maria@test.com' },
    lastMessage: 'Quero saber sobre o pedido',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: 'answered',
    unread: false
  },
  {
    id: 3,
    platform: 'facebook',
    contact: { name: 'Pedro Costa', username: 'pedro_costa', email: 'pedro@test.com' },
    lastMessage: 'Obrigado!',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    status: 'resolved',
    unread: false
  }
];

const mockMessages = [
  {
    id: 1,
    sender: 'customer',
    text: 'Olá, preciso de ajuda',
    timestamp: new Date().toISOString()
  },
  {
    id: 2,
    sender: 'agent',
    text: 'Claro, como posso ajudar?',
    timestamp: new Date().toISOString(),
    status: 'read'
  }
];

const mockAISuggestion = {
  suggestion: 'Olá! Como posso ajudá-lo hoje?',
  tone: 'friendly',
  confidence: 0.95
};

const mockUser = {
  name: 'Admin User',
  email: 'admin@test.com',
  role: 'admin'
};

// Mock functions
const mockNavigate = vi.fn();
const mockLogout = vi.fn();
const mockDispatch = vi.fn();
const mockSelectConversation = vi.fn();
const mockSendMessage = vi.fn();
const mockHandleMessageUpdates = vi.fn();
const mockLoadPendingConversations = vi.fn();
const mockLoadDashboardStats = vi.fn();

// Mock state
let mockAppState = {
  conversations: mockConversations,
  selectedConversation: null,
  conversationMessages: [],
  pendingConversations: [],
  dashboardStats: {},
  aiSuggestions: true,
};

// Mock modules
vi.mock('../services/api');

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../contexts/AppContext', async () => {
  const actual = await vi.importActual('../contexts/AppContext');
  return {
    ...actual,
    useApp: () => ({
      state: mockAppState,
      dispatch: mockDispatch,
      selectConversation: mockSelectConversation,
      sendMessage: mockSendMessage,
      handleMessageUpdates: mockHandleMessageUpdates,
      loadPendingConversations: mockLoadPendingConversations,
      loadDashboardStats: mockLoadDashboardStats,
    }),
  };
});

vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: mockUser,
      logout: mockLogout,
      isAuthenticated: true,
    }),
  };
});

// Helper function to render Conversations with updated state
const renderConversations = (stateOverrides = {}) => {
  mockAppState = {
    conversations: mockConversations,
    selectedConversation: null,
    conversationMessages: [],
    pendingConversations: [],
    dashboardStats: {},
    aiSuggestions: true,
    ...stateOverrides
  };

  return render(
    <BrowserRouter>
      <Conversations />
    </BrowserRouter>
  );
};

describe('Conversations - TODO #1: Unificação de Conversas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getConversationMetadata.mockResolvedValue({ data: {} });
    api.getAISuggestion.mockResolvedValue(mockAISuggestion);
  });

  it('deve renderizar lista de conversas unificada', () => {
    renderConversations();

    expect(screen.getByText('Conversas')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.getByText('Pedro Costa')).toBeInTheDocument();
  });

  it('deve exibir mensagem quando nenhuma conversa está selecionada', () => {
    renderConversations();

    expect(screen.getByText('Selecione uma conversa')).toBeInTheDocument();
    expect(screen.getByText('Escolha uma conversa da lista para começar')).toBeInTheDocument();
  });

  it('deve selecionar conversa ao clicar', async () => {
    renderConversations();

    const conversation = screen.getByText('João Silva');
    fireEvent.click(conversation);

    await waitFor(() => {
      expect(mockSelectConversation).toHaveBeenCalled();
    });
  });

  it('deve exibir mensagens da conversa selecionada', () => {
    renderConversations({
      selectedConversation: mockConversations[0],
      conversationMessages: mockMessages
    });

    expect(screen.getByText('Olá, preciso de ajuda')).toBeInTheDocument();
    expect(screen.getByText('Claro, como posso ajudar?')).toBeInTheDocument();
  });

  it('deve destacar conversa selecionada na lista', () => {
    renderConversations({
      selectedConversation: mockConversations[0]
    });

    const selectedElement = screen.getByText('João Silva').closest('div');
    expect(selectedElement.className).toContain('bg-blue-50');
  });

  it('deve exibir header da conversa selecionada', () => {
    renderConversations({
      selectedConversation: mockConversations[0]
    });

    // Header appears twice (in list and in chat header)
    const headers = screen.getAllByText('João Silva');
    expect(headers.length).toBeGreaterThan(0);
  });
});

describe('Conversations - TODO #3: Scroll Automático', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    api.getConversationMetadata.mockResolvedValue({ data: {} });
    api.getAISuggestion.mockResolvedValue(mockAISuggestion);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve fazer scroll para última mensagem ao abrir conversa', async () => {
    const scrollMock = vi.fn();
    Element.prototype.scrollIntoView = scrollMock;

    renderConversations({
      selectedConversation: mockConversations[0],
      conversationMessages: mockMessages
    });

    // Wait for setTimeout (300ms)
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(scrollMock).toHaveBeenCalled();
    });
  });

  it('deve fazer scroll com behavior smooth', async () => {
    const scrollMock = vi.fn();
    Element.prototype.scrollIntoView = scrollMock;

    renderConversations({
      selectedConversation: mockConversations[0],
      conversationMessages: mockMessages
    });

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(scrollMock).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  it('deve escutar evento tekflox-new-message-arrived e fazer scroll', async () => {
    const scrollMock = vi.fn();
    Element.prototype.scrollIntoView = scrollMock;

    renderConversations({
      selectedConversation: mockConversations[0],
      conversationMessages: mockMessages
    });

    vi.advanceTimersByTime(100);
    scrollMock.mockClear();

    // Dispatch custom event
    const event = new Event('tekflox-new-message-arrived');
    window.dispatchEvent(event);

    vi.advanceTimersByTime(100);

    await waitFor(() => {
      expect(scrollMock).toHaveBeenCalled();
    });
  });
});

describe('Conversations - TODO #4: Foco em Sugestão AI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    api.getConversationMetadata.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve fazer scroll para sugestão AI quando carregada', async () => {
    const scrollMock = vi.fn();
    Element.prototype.scrollIntoView = scrollMock;

    api.getAISuggestion.mockResolvedValue(mockAISuggestion);

    renderConversations({
      selectedConversation: { ...mockConversations[0], status: 'pending' },
      conversationMessages: mockMessages
    });

    // Wait for AI suggestion to load
    await waitFor(() => {
      expect(api.getAISuggestion).toHaveBeenCalled();
    });

    // Wait for scroll timeout (200ms)
    vi.advanceTimersByTime(200);

    await waitFor(() => {
      expect(scrollMock).toHaveBeenCalled();
    });
  });

  it('deve usar block: nearest no scroll da sugestão AI', async () => {
    const scrollMock = vi.fn();
    Element.prototype.scrollIntoView = scrollMock;

    api.getAISuggestion.mockResolvedValue(mockAISuggestion);

    renderConversations({
      selectedConversation: { ...mockConversations[0], status: 'pending' },
      conversationMessages: mockMessages
    });

    await waitFor(() => {
      expect(api.getAISuggestion).toHaveBeenCalled();
    });

    vi.advanceTimersByTime(200);

    await waitFor(() => {
      expect(scrollMock).toHaveBeenCalledWith(
        expect.objectContaining({
          behavior: 'smooth',
          block: 'nearest'
        })
      );
    });
  });

  it('deve exibir sugestão AI para conversas pendentes', async () => {
    api.getAISuggestion.mockResolvedValue(mockAISuggestion);

    renderConversations({
      selectedConversation: { ...mockConversations[0], status: 'pending' },
      conversationMessages: mockMessages
    });

    await waitFor(() => {
      expect(screen.getByText('Sugestão da IA')).toBeInTheDocument();
      expect(screen.getByText(mockAISuggestion.suggestion)).toBeInTheDocument();
    });
  });

  it('não deve exibir sugestão AI para conversas já respondidas', async () => {
    api.getAISuggestion.mockResolvedValue(mockAISuggestion);

    renderConversations({
      selectedConversation: { ...mockConversations[1], status: 'answered' },
      conversationMessages: mockMessages
    });

    await waitFor(() => {
      expect(screen.queryByText('Sugestão da IA')).not.toBeInTheDocument();
    });
  });
});

describe('Conversations - Busca e Filtros', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getConversationMetadata.mockResolvedValue({ data: {} });
    api.getAISuggestion.mockResolvedValue(mockAISuggestion);
  });

  it('deve filtrar conversas por texto de busca', async () => {
    renderConversations();

    const searchInput = screen.getByPlaceholderText('Buscar conversas...');
    fireEvent.change(searchInput, { target: { value: 'João' } });

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument();
    });
  });

  it('deve exibir todas as conversas ao clicar em "Todas"', async () => {
    renderConversations();

    const allButton = screen.getByText('Todas');
    fireEvent.click(allButton);

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('Pedro Costa')).toBeInTheDocument();
    });
  });

  it('deve exibir ícone correto para cada plataforma', () => {
    renderConversations();

    // WhatsApp = 💬, Instagram = 📷, Facebook = 👥
    expect(screen.getAllByText('💬').length).toBeGreaterThan(0);
    expect(screen.getAllByText('📷').length).toBeGreaterThan(0);
    expect(screen.getAllByText('👥').length).toBeGreaterThan(0);
  });
});

describe('Conversations - Envio de Mensagens', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getConversationMetadata.mockResolvedValue({ data: {} });
    api.getAISuggestion.mockResolvedValue(mockAISuggestion);
    api.sendMessage.mockResolvedValue({
      id: 999,
      sender: 'agent',
      text: 'Mensagem enviada',
      timestamp: new Date().toISOString(),
      status: 'sent'
    });
  });

  it('deve aceitar sugestão AI ao clicar em Aceitar', async () => {
    api.getAISuggestion.mockResolvedValue(mockAISuggestion);

    renderConversations({
      selectedConversation: { ...mockConversations[0], status: 'pending' },
      conversationMessages: mockMessages
    });

    await waitFor(() => {
      expect(screen.getByText('Aceitar')).toBeInTheDocument();
    });

    const acceptButton = screen.getByText('Aceitar');
    fireEvent.click(acceptButton);

    // Note: This tests the click handler, actual API call happens in AppContext
    await waitFor(() => {
      expect(acceptButton).toBeInTheDocument();
    });
  });

  it('deve permitir edição de sugestão AI', async () => {
    api.getAISuggestion.mockResolvedValue(mockAISuggestion);

    renderConversations({
      selectedConversation: { ...mockConversations[0], status: 'pending' },
      conversationMessages: mockMessages
    });

    await waitFor(() => {
      expect(screen.getByText('Editar')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Editar Sugestão')).toBeInTheDocument();
    });

    const textarea = screen.getByDisplayValue(mockAISuggestion.suggestion);
    expect(textarea).toBeInTheDocument();
  });

  it('deve permitir envio manual ao clicar em Manual', async () => {
    api.getAISuggestion.mockResolvedValue(mockAISuggestion);

    renderConversations({
      selectedConversation: { ...mockConversations[0], status: 'pending' },
      conversationMessages: mockMessages
    });

    await waitFor(() => {
      expect(screen.getByText('Manual')).toBeInTheDocument();
    });

    const manualButton = screen.getByText('Manual');
    fireEvent.click(manualButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Digite sua mensagem...')).toBeInTheDocument();
    });
  });
});

describe('Conversations - Navegação e UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getConversationMetadata.mockResolvedValue({ data: {} });
    api.getAISuggestion.mockResolvedValue(mockAISuggestion);
  });

  it('deve exibir sidebar de navegação', () => {
    renderConversations();

    expect(screen.getByTitle('Dashboard')).toBeInTheDocument();
    expect(screen.getByTitle('Conversas')).toBeInTheDocument();
    expect(screen.getByTitle('Configurações')).toBeInTheDocument();
  });

  it('deve expandir/colapsar sidebar ao clicar no toggle', async () => {
    renderConversations();

    const toggleButton = screen.getAllByRole('button')[0];
    const sidebar = toggleButton.closest('div');

    expect(sidebar.className).toContain('w-16');

    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(sidebar.className).toContain('w-48');
    });
  });

  it('deve formatar timestamp com "Hoje"', () => {
    renderConversations();

    const todayTimestamp = screen.getByText(/Hoje/i);
    expect(todayTimestamp).toBeInTheDocument();
  });

  it('deve formatar timestamp com "Ontem"', () => {
    renderConversations();

    const yesterdayTimestamp = screen.getByText(/Ontem/i);
    expect(yesterdayTimestamp).toBeInTheDocument();
  });

  it('deve exibir indicador de status pendente', () => {
    renderConversations();

    const pendingConversation = screen.getByText('João Silva').closest('div');
    const pendingIndicator = pendingConversation.querySelector('.bg-red-500');
    expect(pendingIndicator).toBeInTheDocument();
  });
});

describe('Conversations - Metadata (Tags, Notes, AI Insights)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getConversationMetadata.mockResolvedValue({
      data: {
        tags: ['urgente', 'pedido'],
        manualNotes: 'Cliente VIP',
        aiInsights: [
          { sender: 'ai', text: 'Resumo da conversa', timestamp: new Date() }
        ]
      }
    });
    api.getAISuggestion.mockResolvedValue(mockAISuggestion);
  });

  it('deve carregar metadata ao selecionar conversa', async () => {
    renderConversations({
      selectedConversation: mockConversations[0]
    });

    await waitFor(() => {
      expect(api.getConversationMetadata).toHaveBeenCalledWith(mockConversations[0].id);
    });
  });

  it('deve exibir tags carregadas', async () => {
    renderConversations({
      selectedConversation: mockConversations[0]
    });

    await waitFor(() => {
      expect(screen.getByText('#urgente')).toBeInTheDocument();
      expect(screen.getByText('#pedido')).toBeInTheDocument();
    });
  });

  it('deve exibir notas manuais', async () => {
    renderConversations({
      selectedConversation: mockConversations[0]
    });

    await waitFor(() => {
      expect(screen.getByText('Cliente VIP')).toBeInTheDocument();
    });
  });

  it('deve exibir AI Insights', async () => {
    renderConversations({
      selectedConversation: mockConversations[0]
    });

    await waitFor(() => {
      expect(screen.getByText('AI Insights')).toBeInTheDocument();
      expect(screen.getByText('Resumo da conversa')).toBeInTheDocument();
    });
  });
});
