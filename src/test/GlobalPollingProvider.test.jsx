import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { GlobalPollingProvider } from '../components/GlobalPollingProvider'
import { AuthProvider } from '../contexts/AuthContext'
import * as api from '../services/api'

vi.mock('../services/api')

describe('GlobalPollingProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  const renderProvider = (isAuthenticated = true) => {
    if (isAuthenticated) {
      localStorage.setItem('token', 'fake-token')
      localStorage.setItem('user', JSON.stringify({ name: 'Test User' }))
    }

    return render(
      <AuthProvider>
        <GlobalPollingProvider>
          <div>Test Child</div>
        </GlobalPollingProvider>
      </AuthProvider>
    )
  }

  it('deve renderizar children', () => {
    const { container } = renderProvider()

    expect(container.textContent).toContain('Test Child')
  })

  it('deve iniciar polling quando autenticado', async () => {
    api.getUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      conversations: [],
      timestamp: new Date().toISOString()
    })

    renderProvider(true)

    await waitFor(() => {
      expect(api.getUpdates).toHaveBeenCalled()
    })
  })

  it('não deve iniciar polling quando não autenticado', async () => {
    api.getUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      conversations: [],
      timestamp: new Date().toISOString()
    })

    renderProvider(false)

    vi.advanceTimersByTime(10000)

    await waitFor(() => {
      expect(api.getUpdates).not.toHaveBeenCalled()
    })
  })

  it('deve disparar evento customizado quando houver atualizações', async () => {
    const mockUpdates = {
      hasUpdates: true,
      messages: [{ id: 1, text: 'Nova mensagem' }],
      conversations: [{ id: 1, name: 'João' }],
      timestamp: new Date().toISOString(),
      lastMessageId: 1
    }

    api.getUpdates.mockResolvedValue(mockUpdates)

    const eventListener = vi.fn()
    window.addEventListener('tekflox-global-updates', eventListener)

    renderProvider(true)

    await waitFor(() => {
      expect(eventListener).toHaveBeenCalled()
    })

    const eventDetail = eventListener.mock.calls[0][0].detail
    expect(eventDetail.messages).toHaveLength(1)
    expect(eventDetail.conversations).toHaveLength(1)

    window.removeEventListener('tekflox-global-updates', eventListener)
  })

  it('não deve disparar evento quando não houver atualizações', async () => {
    api.getUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      conversations: [],
      timestamp: new Date().toISOString()
    })

    const eventListener = vi.fn()
    window.addEventListener('tekflox-global-updates', eventListener)

    renderProvider(true)

    vi.advanceTimersByTime(10000)

    await waitFor(() => {
      expect(api.getUpdates).toHaveBeenCalled()
    })

    expect(eventListener).not.toHaveBeenCalled()

    window.removeEventListener('tekflox-global-updates', eventListener)
  })

  it('deve fazer polling a cada 5 segundos', async () => {
    api.getUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      conversations: [],
      timestamp: new Date().toISOString()
    })

    renderProvider(true)

    await waitFor(() => {
      expect(api.getUpdates).toHaveBeenCalledTimes(1)
    })

    vi.advanceTimersByTime(5000)

    await waitFor(() => {
      expect(api.getUpdates).toHaveBeenCalledTimes(2)
    })

    vi.advanceTimersByTime(5000)

    await waitFor(() => {
      expect(api.getUpdates).toHaveBeenCalledTimes(3)
    })
  })

  it('deve logar erros no console', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    api.getUpdates.mockRejectedValue(new Error('Network error'))

    renderProvider(true)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[GlobalPolling] ❌ Error:',
        expect.any(Error)
      )
    })

    consoleErrorSpy.mockRestore()
  })

  it('deve logar status de polling no console', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    api.getUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      conversations: [],
      timestamp: new Date().toISOString()
    })

    renderProvider(true)

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[GlobalPolling] ✅ Polling active (every 5 seconds)'
      )
    })

    consoleLogSpy.mockRestore()
  })

  it('deve limpar polling ao desmontar', async () => {
    api.getUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      conversations: [],
      timestamp: new Date().toISOString()
    })

    const { unmount } = renderProvider(true)

    await waitFor(() => {
      expect(api.getUpdates).toHaveBeenCalled()
    })

    const callCount = api.getUpdates.mock.calls.length

    unmount()

    vi.advanceTimersByTime(10000)

    // Não deve ter chamado mais após desmontar
    expect(api.getUpdates).toHaveBeenCalledTimes(callCount)
  })
})
