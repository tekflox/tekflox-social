import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import axios from 'axios'

vi.mock('axios')

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

  it('deve fornecer contexto de autenticação', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current).toBeDefined()
    expect(result.current).toHaveProperty('login')
    expect(result.current).toHaveProperty('logout')
    expect(result.current).toHaveProperty('isAuthenticated')
    expect(result.current).toHaveProperty('user')
    expect(result.current).toHaveProperty('token')
  })

  it('deve inicializar não autenticado', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
  })

  it('deve carregar token e user do localStorage', () => {
    const mockUser = { name: 'Test User', email: 'test@email.com' }
    localStorage.setItem('token', 'saved-token')
    localStorage.setItem('user', JSON.stringify(mockUser))

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.token).toBe('saved-token')
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('deve fazer login com sucesso', async () => {
    const mockResponse = {
      data: {
        token: 'new-token',
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

    const { result } = renderHook(() => useAuth(), { wrapper })

    const loginResult = await result.current.login('admin', 'admin123', 'http://localhost:3002')

    expect(loginResult.success).toBe(true)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.token).toBe('new-token')
    expect(result.current.user).toEqual(mockResponse.data.user)
  })

  it('deve salvar dados no localStorage após login', async () => {
    const mockResponse = {
      data: {
        token: 'new-token',
        user: { id: 1, username: 'admin', name: 'Admin User' }
      }
    }

    axios.post.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await result.current.login('admin', 'admin123', 'http://localhost:3002')

    expect(localStorage.getItem('token')).toBe('new-token')
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockResponse.data.user))
    expect(localStorage.getItem('baseURL')).toBe('http://localhost:3002')
  })

  it('deve remover trailing slash da URL', async () => {
    const mockResponse = {
      data: {
        token: 'new-token',
        user: { id: 1, username: 'admin' }
      }
    }

    axios.post.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await result.current.login('admin', 'admin123', 'http://localhost:3002/')

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3002/api/auth/login',
      { username: 'admin', password: 'admin123' }
    )
  })

  it('deve detectar URL WordPress e usar path correto', async () => {
    const mockResponse = {
      data: {
        token: 'wp-token',
        user: { id: 1, username: 'admin' }
      }
    }

    axios.post.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await result.current.login('admin', 'admin123', 'http://wordpress.com/wp-json/tekflox-social')

    expect(axios.post).toHaveBeenCalledWith(
      'http://wordpress.com/wp-json/tekflox-social/v1/auth/login',
      { username: 'admin', password: 'admin123' }
    )
  })

  it('deve retornar erro ao falhar login', async () => {
    axios.post.mockRejectedValue({
      response: {
        data: {
          error: 'Credenciais inválidas'
        }
      }
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    const loginResult = await result.current.login('wrong', 'wrong', 'http://localhost:3002')

    expect(loginResult.success).toBe(false)
    expect(loginResult.error).toBe('Credenciais inválidas')
    expect(result.current.error).toBe('Credenciais inválidas')
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('deve mostrar loading durante login', async () => {
    axios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    const { result } = renderHook(() => useAuth(), { wrapper })

    const loginPromise = result.current.login('admin', 'admin123', 'http://localhost:3002')

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true)
    })

    await loginPromise
  })

  it('deve fazer logout com sucesso', async () => {
    const mockUser = { name: 'Test User' }
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify(mockUser))

    axios.post.mockResolvedValue({})

    const { result } = renderHook(() => useAuth(), { wrapper })

    // Confirma que está autenticado
    expect(result.current.isAuthenticated).toBe(true)

    await result.current.logout()

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
  })

  it('deve limpar localStorage ao fazer logout', async () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify({ name: 'Test' }))
    localStorage.setItem('tekflox_last_message_id', '42')
    localStorage.setItem('tekflox_last_timestamp', '2025-10-11')

    axios.post.mockResolvedValue({})

    const { result } = renderHook(() => useAuth(), { wrapper })

    await result.current.logout()

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    expect(localStorage.getItem('tekflox_last_message_id')).toBeNull()
    expect(localStorage.getItem('tekflox_last_timestamp')).toBeNull()
  })

  it('deve fazer logout mesmo se notificação ao servidor falhar', async () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify({ name: 'Test' }))

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    axios.post.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useAuth(), { wrapper })

    await result.current.logout()

    expect(result.current.isAuthenticated).toBe(false)
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[Auth] Logout notification failed (continuing anyway):',
      expect.any(Error)
    )

    consoleWarnSpy.mockRestore()
  })

  it('deve lançar erro se useAuth for usado fora do provider', () => {
    // Suprime console.error para este teste
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleErrorSpy.mockRestore()
  })

  it('deve carregar baseURL do localStorage', () => {
    localStorage.setItem('baseURL', 'http://custom-server.com')

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.baseURL).toBe('http://custom-server.com')
  })

  it('deve usar baseURL padrão se não houver no localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.baseURL).toBe('http://localhost:3002')
  })

  it('deve limpar erro ao fazer novo login', async () => {
    // Primeiro login falha
    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Erro anterior' } }
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await result.current.login('wrong', 'wrong', 'http://localhost:3002')

    expect(result.current.error).toBe('Erro anterior')

    // Segundo login bem-sucedido
    axios.post.mockResolvedValueOnce({
      data: {
        token: 'new-token',
        user: { id: 1, name: 'User' }
      }
    })

    await result.current.login('admin', 'admin123', 'http://localhost:3002')

    expect(result.current.error).toBeNull()
  })

  it('deve limpar isLoading após login bem-sucedido', async () => {
    axios.post.mockResolvedValue({
      data: {
        token: 'new-token',
        user: { id: 1, name: 'User' }
      }
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await result.current.login('admin', 'admin123', 'http://localhost:3002')

    expect(result.current.isLoading).toBe(false)
  })

  it('deve limpar isLoading após login falhar', async () => {
    axios.post.mockRejectedValue({
      response: { data: { error: 'Erro' } }
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await result.current.login('wrong', 'wrong', 'http://localhost:3002')

    expect(result.current.isLoading).toBe(false)
  })
})
