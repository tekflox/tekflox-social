import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useGlobalPolling } from '../hooks/useGlobalPolling'
import * as api from '../services/api'

vi.mock('../services/api')

describe('useGlobalPolling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    localStorage.clear()
  })

  const mockUpdatesResponse = {
    hasUpdates: true,
    messages: [{ id: 1, text: 'Nova mensagem' }],
    conversations: [{ id: 1, name: 'João' }],
    timestamp: '2025-10-11T10:00:00',
    lastMessageId: 1,
    lastTimestamp: '2025-10-11T10:00:00'
  }

  it('deve iniciar polling quando enabled', async () => {
    api.getUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      conversations: [],
      timestamp: '2025-10-11T10:00:00'
    })

    renderHook(() => useGlobalPolling(true, 5000))

    await waitFor(() => {
      expect(api.getUpdates).toHaveBeenCalled()
    })
  })

  it('não deve iniciar polling quando disabled', async () => {
    renderHook(() => useGlobalPolling(false, 5000))

    vi.advanceTimersByTime(10000)

    expect(api.getUpdates).not.toHaveBeenCalled()
  })

  it('deve retornar updates quando houver novos dados', async () => {
    api.getUpdates.mockResolvedValue(mockUpdatesResponse)

    const { result } = renderHook(() => useGlobalPolling(true, 5000))

    await waitFor(() => {
      expect(result.current.updates.hasUpdates).toBe(true)
      expect(result.current.updates.messages).toHaveLength(1)
      expect(result.current.updates.conversations).toHaveLength(1)
    })
  })

  it('deve salvar lastMessageId no localStorage', async () => {
    api.getUpdates.mockResolvedValue(mockUpdatesResponse)

    renderHook(() => useGlobalPolling(true, 5000))

    await waitFor(() => {
      expect(localStorage.getItem('tekflox_last_message_id')).toBe('1')
    })
  })

  it('deve salvar lastTimestamp no localStorage', async () => {
    api.getUpdates.mockResolvedValue(mockUpdatesResponse)

    renderHook(() => useGlobalPolling(true, 5000))

    await waitFor(() => {
      expect(localStorage.getItem('tekflox_last_timestamp')).toBe('2025-10-11T10:00:00')
    })
  })

  it('deve usar lastTimestamp em requisições subsequentes', async () => {
    localStorage.setItem('tekflox_last_timestamp', '2025-10-11T09:00:00')

    api.getUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      conversations: [],
      timestamp: '2025-10-11T10:00:00'
    })

    renderHook(() => useGlobalPolling(true, 5000))

    await waitFor(() => {
      expect(api.getUpdates).toHaveBeenCalledWith(
        expect.objectContaining({
          since_timestamp: '2025-10-11T09:00:00'
        })
      )
    })
  })

  it('deve usar lastMessageId quando timestamp não disponível', async () => {
    localStorage.setItem('tekflox_last_message_id', '42')

    api.getUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      conversations: [],
      timestamp: '2025-10-11T10:00:00'
    })

    renderHook(() => useGlobalPolling(true, 5000))

    await waitFor(() => {
      expect(api.getUpdates).toHaveBeenCalledWith(
        expect.objectContaining({
          since_id: 42
        })
      )
    })
  })

  it('deve fazer polling no intervalo especificado', async () => {
    api.getUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      conversations: [],
      timestamp: '2025-10-11T10:00:00'
    })

    renderHook(() => useGlobalPolling(true, 5000))

    await waitFor(() => {
      expect(api.getUpdates).toHaveBeenCalledTimes(1)
    })

    vi.advanceTimersByTime(5000)

    await waitFor(() => {
      expect(api.getUpdates).toHaveBeenCalledTimes(2)
    })
  })

  it('deve parar polling quando sessão expira', async () => {
    api.getUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      conversations: [],
      timestamp: '2025-10-11T10:00:00'
    })

    renderHook(() => useGlobalPolling(true, 5000))

    await waitFor(() => {
      expect(api.getUpdates).toHaveBeenCalledTimes(1)
    })

    // Dispara evento de sessão expirada
    window.dispatchEvent(new Event('tekflox-session-expired'))

    vi.advanceTimersByTime(10000)

    // Não deve ter continuado polling
    expect(api.getUpdates).toHaveBeenCalledTimes(1)
  })

  it('deve fornecer função reset', () => {
    const { result } = renderHook(() => useGlobalPolling(true, 5000))

    expect(result.current.reset).toBeDefined()
    expect(typeof result.current.reset).toBe('function')
  })

  it('deve limpar localStorage ao chamar reset', async () => {
    localStorage.setItem('tekflox_last_message_id', '42')
    localStorage.setItem('tekflox_last_timestamp', '2025-10-11T10:00:00')

    api.getUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      conversations: [],
      timestamp: '2025-10-11T10:00:00'
    })

    const { result } = renderHook(() => useGlobalPolling(true, 5000))

    await waitFor(() => {
      expect(api.getUpdates).toHaveBeenCalled()
    })

    result.current.reset()

    expect(localStorage.getItem('tekflox_last_message_id')).toBeNull()
    expect(localStorage.getItem('tekflox_last_timestamp')).toBeNull()
  })

  it('deve fornecer função pollNow', () => {
    const { result } = renderHook(() => useGlobalPolling(true, 5000))

    expect(result.current.pollNow).toBeDefined()
    expect(typeof result.current.pollNow).toBe('function')
  })

  it('deve permitir forçar poll imediato com pollNow', async () => {
    api.getUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      conversations: [],
      timestamp: '2025-10-11T10:00:00'
    })

    const { result } = renderHook(() => useGlobalPolling(true, 5000))

    await waitFor(() => {
      expect(api.getUpdates).toHaveBeenCalledTimes(1)
    })

    result.current.pollNow()

    await waitFor(() => {
      expect(api.getUpdates).toHaveBeenCalledTimes(2)
    })
  })

  it('deve retornar erro quando API falha', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    api.getUpdates.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useGlobalPolling(true, 5000))

    await waitFor(() => {
      expect(result.current.error).not.toBeNull()
    })

    consoleErrorSpy.mockRestore()
  })

  it('deve retornar estado de polling', async () => {
    api.getUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      conversations: [],
      timestamp: '2025-10-11T10:00:00'
    })

    const { result } = renderHook(() => useGlobalPolling(true, 5000))

    expect(result.current.isPolling).toBeDefined()
    expect(typeof result.current.isPolling).toBe('boolean')
  })

  it('deve limpar polling ao desmontar', async () => {
    api.getUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      conversations: [],
      timestamp: '2025-10-11T10:00:00'
    })

    const { unmount } = renderHook(() => useGlobalPolling(true, 5000))

    await waitFor(() => {
      expect(api.getUpdates).toHaveBeenCalled()
    })

    const callCount = api.getUpdates.mock.calls.length

    unmount()

    vi.advanceTimersByTime(20000)

    expect(api.getUpdates).toHaveBeenCalledTimes(callCount)
  })

  it('deve carregar lastMessageId do localStorage na inicialização', async () => {
    localStorage.setItem('tekflox_last_message_id', '99')

    api.getUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      conversations: [],
      timestamp: '2025-10-11T10:00:00'
    })

    const { result } = renderHook(() => useGlobalPolling(true, 5000))

    await waitFor(() => {
      expect(result.current.lastMessageId).toBe(99)
    })
  })
})
