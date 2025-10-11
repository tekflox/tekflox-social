import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from '../pages/Login'
import { AuthProvider } from '../contexts/AuthContext'
import axios from 'axios'

vi.mock('axios')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    )
  }

  it('deve renderizar formulário de login', () => {
    renderLogin()

    expect(screen.getByLabelText('Usuário')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByLabelText('URL do Backend')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument()
  })

  it('deve exibir credenciais de teste', () => {
    renderLogin()

    expect(screen.getByText('Credenciais de teste:')).toBeInTheDocument()
    expect(screen.getByText(/admin/)).toBeInTheDocument()
    expect(screen.getByText(/agente/)).toBeInTheDocument()
    expect(screen.getByText(/demo/)).toBeInTheDocument()
  })

  it('deve ter URL padrão de backend preenchida', () => {
    renderLogin()

    const backendInput = screen.getByLabelText('URL do Backend')
    expect(backendInput).toHaveValue('http://localhost:3002')
  })

  it('deve validar campo usuário vazio', async () => {
    renderLogin()

    const submitButton = screen.getByRole('button', { name: /Entrar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Por favor, insira seu usuário')).toBeInTheDocument()
    })
  })

  it('deve validar campo senha vazio', async () => {
    renderLogin()

    const usernameInput = screen.getByLabelText('Usuário')
    fireEvent.change(usernameInput, { target: { value: 'admin' } })

    const submitButton = screen.getByRole('button', { name: /Entrar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Por favor, insira sua senha')).toBeInTheDocument()
    })
  })

  it('deve validar campo backend URL vazio', async () => {
    renderLogin()

    const usernameInput = screen.getByLabelText('Usuário')
    const passwordInput = screen.getByLabelText('Senha')
    const backendInput = screen.getByLabelText('URL do Backend')

    fireEvent.change(usernameInput, { target: { value: 'admin' } })
    fireEvent.change(passwordInput, { target: { value: 'admin123' } })
    fireEvent.change(backendInput, { target: { value: '' } })

    const submitButton = screen.getByRole('button', { name: /Entrar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Por favor, insira a URL do backend')).toBeInTheDocument()
    })
  })

  it('deve validar formato de URL inválida', async () => {
    renderLogin()

    const usernameInput = screen.getByLabelText('Usuário')
    const passwordInput = screen.getByLabelText('Senha')
    const backendInput = screen.getByLabelText('URL do Backend')

    fireEvent.change(usernameInput, { target: { value: 'admin' } })
    fireEvent.change(passwordInput, { target: { value: 'admin123' } })
    fireEvent.change(backendInput, { target: { value: 'invalid-url' } })

    const submitButton = screen.getByRole('button', { name: /Entrar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/URL do backend inválida/i)).toBeInTheDocument()
    })
  })

  it('deve fazer login com sucesso', async () => {
    const mockResponse = {
      data: {
        token: 'fake-token-123',
        user: {
          id: 1,
          username: 'admin',
          name: 'Admin User',
          email: 'admin@test.com',
          role: 'admin'
        }
      }
    }

    axios.post.mockResolvedValue(mockResponse)

    renderLogin()

    const usernameInput = screen.getByLabelText('Usuário')
    const passwordInput = screen.getByLabelText('Senha')

    fireEvent.change(usernameInput, { target: { value: 'admin' } })
    fireEvent.change(passwordInput, { target: { value: 'admin123' } })

    const submitButton = screen.getByRole('button', { name: /Entrar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3002/api/auth/login',
        { username: 'admin', password: 'admin123' }
      )
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/conversations')
    })
  })

  it('deve exibir erro ao falhar login', async () => {
    axios.post.mockRejectedValue({
      response: {
        data: {
          error: 'Credenciais inválidas'
        }
      }
    })

    renderLogin()

    const usernameInput = screen.getByLabelText('Usuário')
    const passwordInput = screen.getByLabelText('Senha')

    fireEvent.change(usernameInput, { target: { value: 'wrong' } })
    fireEvent.change(passwordInput, { target: { value: 'wrong' } })

    const submitButton = screen.getByRole('button', { name: /Entrar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument()
    })
  })

  it('deve mostrar loading durante login', async () => {
    axios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

    renderLogin()

    const usernameInput = screen.getByLabelText('Usuário')
    const passwordInput = screen.getByLabelText('Senha')

    fireEvent.change(usernameInput, { target: { value: 'admin' } })
    fireEvent.change(passwordInput, { target: { value: 'admin123' } })

    const submitButton = screen.getByRole('button', { name: /Entrar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Conectando...')).toBeInTheDocument()
    })
  })

  it('deve marcar checkbox "Lembrar-me"', () => {
    renderLogin()

    const checkbox = screen.getByLabelText(/Lembrar-me neste dispositivo/i)
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('deve salvar credenciais quando "Lembrar-me" está marcado', async () => {
    const mockResponse = {
      data: {
        token: 'fake-token-123',
        user: { id: 1, username: 'admin', name: 'Admin User', role: 'admin' }
      }
    }

    axios.post.mockResolvedValue(mockResponse)

    renderLogin()

    const usernameInput = screen.getByLabelText('Usuário')
    const passwordInput = screen.getByLabelText('Senha')
    const checkbox = screen.getByLabelText(/Lembrar-me neste dispositivo/i)

    fireEvent.change(usernameInput, { target: { value: 'admin' } })
    fireEvent.change(passwordInput, { target: { value: 'admin123' } })
    fireEvent.click(checkbox)

    const submitButton = screen.getByRole('button', { name: /Entrar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(localStorage.getItem('rememberUsername')).toBe('admin')
      expect(localStorage.getItem('rememberPassword')).toBe('admin123')
    })
  })

  it('deve carregar credenciais salvas ao montar', () => {
    localStorage.setItem('rememberUsername', 'saved-user')
    localStorage.setItem('rememberPassword', 'saved-pass')
    localStorage.setItem('baseURL', 'http://custom-url.com')

    renderLogin()

    const usernameInput = screen.getByLabelText('Usuário')
    const passwordInput = screen.getByLabelText('Senha')
    const backendInput = screen.getByLabelText('URL do Backend')
    const checkbox = screen.getByLabelText(/Lembrar-me neste dispositivo/i)

    expect(usernameInput).toHaveValue('saved-user')
    expect(passwordInput).toHaveValue('saved-pass')
    expect(backendInput).toHaveValue('http://custom-url.com')
    expect(checkbox).toBeChecked()
  })

  it('deve remover credenciais salvas quando "Lembrar-me" está desmarcado', async () => {
    localStorage.setItem('rememberUsername', 'saved-user')
    localStorage.setItem('rememberPassword', 'saved-pass')

    const mockResponse = {
      data: {
        token: 'fake-token-123',
        user: { id: 1, username: 'admin', name: 'Admin User', role: 'admin' }
      }
    }

    axios.post.mockResolvedValue(mockResponse)

    renderLogin()

    const checkbox = screen.getByLabelText(/Lembrar-me neste dispositivo/i)
    fireEvent.click(checkbox) // Desmarca

    const submitButton = screen.getByRole('button', { name: /Entrar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(localStorage.getItem('rememberUsername')).toBeNull()
      expect(localStorage.getItem('rememberPassword')).toBeNull()
    })
  })

  it('deve redirecionar automaticamente se já autenticado', () => {
    localStorage.setItem('token', 'existing-token')
    localStorage.setItem('user', JSON.stringify({ name: 'Test User' }))

    renderLogin()

    expect(mockNavigate).toHaveBeenCalledWith('/conversations')
  })
})
