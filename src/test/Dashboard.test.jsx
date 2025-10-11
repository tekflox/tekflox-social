import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import { AppProvider } from '../contexts/AppContext'
import { AuthProvider } from '../contexts/AuthContext'

const mockLoadPendingConversations = vi.fn()
const mockLoadDashboardStats = vi.fn()
const mockSendMessage = vi.fn()

vi.mock('../contexts/AppContext', async () => {
  const actual = await vi.importActual('../contexts/AppContext')
  return {
    ...actual,
    useApp: () => ({
      state: {
        pendingConversations: [],
        dashboardStats: {
          totalConversations: 150,
          pending: 12,
          answered: 100,
          resolved: 38,
          byPlatform: {
            whatsapp: 80,
            instagram: 45,
            facebook: 25
          }
        }
      },
      loadPendingConversations: mockLoadPendingConversations,
      loadDashboardStats: mockLoadDashboardStats,
      sendMessage: mockSendMessage
    })
  }
})

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ name: 'Test User' }))
  })

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <Dashboard />
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    )
  }

  it('deve renderizar título do dashboard', async () => {
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
    })
  })

  it('deve carregar dados ao montar', async () => {
    renderDashboard()

    await waitFor(() => {
      expect(mockLoadPendingConversations).toHaveBeenCalled()
      expect(mockLoadDashboardStats).toHaveBeenCalled()
    })
  })

  it('deve exibir estatísticas de conversas', async () => {
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument() // Total de Conversas
      expect(screen.getByText('12')).toBeInTheDocument()  // Pendentes
      expect(screen.getByText('100')).toBeInTheDocument() // Respondidas
      expect(screen.getByText('38')).toBeInTheDocument()  // Resolvidas
    })
  })

  it('deve exibir labels dos cards de estatísticas', async () => {
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Total de Conversas')).toBeInTheDocument()
      expect(screen.getByText('Mensagens Pendentes')).toBeInTheDocument()
      expect(screen.getByText('Respondidas')).toBeInTheDocument()
      expect(screen.getByText('Resolvidas')).toBeInTheDocument()
    })
  })

  it('deve exibir estatísticas por plataforma', async () => {
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Conversas por Plataforma')).toBeInTheDocument()
      expect(screen.getByText('80')).toBeInTheDocument() // WhatsApp
      expect(screen.getByText('45')).toBeInTheDocument() // Instagram
      expect(screen.getByText('25')).toBeInTheDocument() // Facebook
    })
  })

  it('deve exibir nomes das plataformas', async () => {
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('whatsapp')).toBeInTheDocument()
      expect(screen.getByText('instagram')).toBeInTheDocument()
      expect(screen.getByText('facebook')).toBeInTheDocument()
    })
  })

  it('deve exibir seção de mensagens pendentes', async () => {
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText(/Mensagens Pendentes com Sugestões de IA/i)).toBeInTheDocument()
    })
  })

  it('deve exibir mensagem quando não há pendências', async () => {
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Tudo em dia! 🎉')).toBeInTheDocument()
      expect(screen.getByText('Não há mensagens pendentes no momento.')).toBeInTheDocument()
    })
  })
})

describe('Dashboard com conversas pendentes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ name: 'Test User' }))
  })

  it('deve renderizar cards de conversas pendentes', async () => {
    vi.mock('../contexts/AppContext', async () => {
      const actual = await vi.importActual('../contexts/AppContext')
      return {
        ...actual,
        useApp: () => ({
          state: {
            pendingConversations: [
              {
                id: 1,
                contact: { name: 'João Silva' },
                lastMessage: 'Preciso de ajuda',
                aiSuggestion: 'Olá! Como posso ajudar?',
                platform: 'whatsapp'
              }
            ],
            dashboardStats: {
              totalConversations: 150,
              pending: 1,
              answered: 100,
              resolved: 49
            }
          },
          loadPendingConversations: mockLoadPendingConversations,
          loadDashboardStats: mockLoadDashboardStats,
          sendMessage: mockSendMessage
        })
      }
    })

    const { default: DashboardWithPending } = await import('../pages/Dashboard')

    render(
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <DashboardWithPending />
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Tudo em dia! 🎉')).not.toBeInTheDocument()
    })
  })
})

describe('Dashboard loading state', () => {
  it('deve exibir loading ao carregar dados', () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <Dashboard />
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('Carregando dashboard...')).toBeInTheDocument()
  })
})
