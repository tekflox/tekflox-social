import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from '../components/Layout'
import { AuthProvider } from '../contexts/AuthContext'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' })
  }
})

describe('Layout', () => {
  const mockUser = {
    name: 'João Silva',
    email: 'joao@email.com',
    role: 'admin'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify(mockUser))
  })

  const renderLayout = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </BrowserRouter>
    )
  }

  it('deve renderizar sidebar colapsada por padrão', () => {
    renderLayout()

    const sidebar = screen.getByRole('button', { name: '' }).parentElement
    expect(sidebar).toHaveClass('w-16')
  })

  it('deve expandir sidebar ao clicar no botão toggle', () => {
    renderLayout()

    const toggleButton = screen.getAllByRole('button')[0]
    fireEvent.click(toggleButton)

    const sidebar = toggleButton.parentElement
    expect(sidebar).toHaveClass('w-48')
  })

  it('deve renderizar todos os itens de navegação', () => {
    renderLayout()

    // Expande sidebar para ver labels
    const toggleButton = screen.getAllByRole('button')[0]
    fireEvent.click(toggleButton)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Conversas')).toBeInTheDocument()
    expect(screen.getByText('Configurações')).toBeInTheDocument()
  })

  it('deve navegar ao clicar em item de navegação', () => {
    renderLayout()

    const buttons = screen.getAllByRole('button')
    // Encontra botão de Conversas (segundo na lista após toggle)
    const conversasButton = buttons.find(btn => btn.title === 'Conversas')

    fireEvent.click(conversasButton)

    expect(mockNavigate).toHaveBeenCalledWith('/conversations')
  })

  it('deve exibir informações do usuário quando sidebar expandida', () => {
    renderLayout()

    const toggleButton = screen.getAllByRole('button')[0]
    fireEvent.click(toggleButton)

    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('joao@email.com')).toBeInTheDocument()
    expect(screen.getByText('Administrador')).toBeInTheDocument()
  })

  it('deve exibir role de agente corretamente', () => {
    const agentUser = { ...mockUser, role: 'agent' }
    localStorage.setItem('user', JSON.stringify(agentUser))

    renderLayout()

    const toggleButton = screen.getAllByRole('button')[0]
    fireEvent.click(toggleButton)

    expect(screen.getByText('Agente')).toBeInTheDocument()
  })

  it('deve ter botão de logout', () => {
    renderLayout()

    const toggleButton = screen.getAllByRole('button')[0]
    fireEvent.click(toggleButton)

    expect(screen.getByText('Sair')).toBeInTheDocument()
  })

  it('deve fazer logout ao clicar no botão', async () => {
    renderLayout()

    const logoutButton = screen.getByTitle('Sair')
    fireEvent.click(logoutButton)

    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('deve destacar item de navegação ativo', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </BrowserRouter>
    )

    const dashboardButton = screen.getByTitle('Dashboard')
    expect(dashboardButton).toHaveClass('text-white', 'bg-gray-800')
  })

  it('deve renderizar outlet para conteúdo das páginas', () => {
    renderLayout()

    // Verifica se há um elemento main que é o container do Outlet
    const main = document.querySelector('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveClass('flex-1', 'overflow-auto')
  })

  it('deve colapsar sidebar ao clicar novamente no toggle', () => {
    renderLayout()

    const toggleButton = screen.getAllByRole('button')[0]

    // Expande
    fireEvent.click(toggleButton)
    expect(toggleButton.parentElement).toHaveClass('w-48')

    // Colapsa
    fireEvent.click(toggleButton)
    expect(toggleButton.parentElement).toHaveClass('w-16')
  })
})
