import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useMessagePolling, useMessageStatusSimulation } from '../hooks/useMessagePolling'
import * as api from '../services/api'

vi.mock('../services/api')

describe('useMessagePolling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('deve iniciar polling quando enabled é true', async () => {
    const mockOnUpdate = vi.fn()
    api.getMessageUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      timeout: true
    })

    renderHook(() => useMessagePolling(1, mockOnUpdate, 15000, true))

    vi.advanceTimersByTime(500)

    await waitFor(() => {
      expect(api.getMessageUpdates).toHaveBeenCalledWith(
        1,
        expect.any(Date),
        15000,
        expect.any(AbortSignal)
      )
    })
  })

  it('não deve iniciar polling quando enabled é false', async () => {
    const mockOnUpdate = vi.fn()

    renderHook(() => useMessagePolling(1, mockOnUpdate, 15000, false))

    vi.advanceTimersByTime(1000)

    expect(api.getMessageUpdates).not.toHaveBeenCalled()
  })

  it('não deve iniciar polling sem conversationId', async () => {
    const mockOnUpdate = vi.fn()

    renderHook(() => useMessagePolling(null, mockOnUpdate, 15000, true))

    vi.advanceTimersByTime(1000)

    expect(api.getMessageUpdates).not.toHaveBeenCalled()
  })

  it('deve chamar onUpdate quando houver mensagens novas', async () => {
    const mockOnUpdate = vi.fn()
    const mockMessages = [
      { id: 1, text: 'Nova mensagem', sender: 'customer' }
    ]

    api.getMessageUpdates.mockResolvedValue({
      hasUpdates: true,
      messages: mockMessages,
      timeout: false
    })

    renderHook(() => useMessagePolling(1, mockOnUpdate, 15000, true))

    vi.advanceTimersByTime(500)

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(mockMessages)
    })
  })

  it('não deve chamar onUpdate quando não houver atualizações', async () => {
    const mockOnUpdate = vi.fn()

    api.getMessageUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      timeout: true
    })

    renderHook(() => useMessagePolling(1, mockOnUpdate, 15000, true))

    vi.advanceTimersByTime(500)

    await waitFor(() => {
      expect(api.getMessageUpdates).toHaveBeenCalled()
    })

    expect(mockOnUpdate).not.toHaveBeenCalled()
  })

  it('deve reconectar após timeout', async () => {
    const mockOnUpdate = vi.fn()

    api.getMessageUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      timeout: true
    })

    renderHook(() => useMessagePolling(1, mockOnUpdate, 15000, true))

    vi.advanceTimersByTime(500)

    await waitFor(() => {
      expect(api.getMessageUpdates).toHaveBeenCalledTimes(1)
    })

    // Aguarda 3 segundos de delay para reconexão
    vi.advanceTimersByTime(3000)

    await waitFor(() => {
      expect(api.getMessageUpdates).toHaveBeenCalledTimes(2)
    })
  })

  it('deve abortar requisição ao trocar de conversa', async () => {
    const mockOnUpdate = vi.fn()

    api.getMessageUpdates.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        hasUpdates: false,
        messages: [],
        timeout: true
      }), 5000))
    )

    const { rerender, unmount } = renderHook(
      ({ conversationId }) => useMessagePolling(conversationId, mockOnUpdate, 15000, true),
      { initialProps: { conversationId: 1 } }
    )

    vi.advanceTimersByTime(500)

    // Troca para outra conversa
    rerender({ conversationId: 2 })

    // Aguarda um pouco
    vi.advanceTimersByTime(1000)

    unmount()
  })

  it('deve tratar erro de rede', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const mockOnUpdate = vi.fn()

    api.getMessageUpdates.mockRejectedValue(new Error('Network error'))

    renderHook(() => useMessagePolling(1, mockOnUpdate, 15000, true))

    vi.advanceTimersByTime(500)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Long Polling] Error:',
        expect.any(Error)
      )
    })

    consoleErrorSpy.mockRestore()
  })

  it('deve retornar estado de polling', async () => {
    const mockOnUpdate = vi.fn()

    api.getMessageUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      timeout: true
    })

    const { result } = renderHook(() => useMessagePolling(1, mockOnUpdate, 15000, true))

    expect(result.current).toHaveProperty('isPolling')
    expect(typeof result.current.isPolling).toBe('boolean')
  })

  it('deve limpar polling ao desmontar', async () => {
    const mockOnUpdate = vi.fn()

    api.getMessageUpdates.mockResolvedValue({
      hasUpdates: false,
      messages: [],
      timeout: true
    })

    const { unmount } = renderHook(() => useMessagePolling(1, mockOnUpdate, 15000, true))

    vi.advanceTimersByTime(500)

    await waitFor(() => {
      expect(api.getMessageUpdates).toHaveBeenCalled()
    })

    const callCount = api.getMessageUpdates.mock.calls.length

    unmount()

    vi.advanceTimersByTime(10000)

    expect(api.getMessageUpdates).toHaveBeenCalledTimes(callCount)
  })
})

describe('useMessageStatusSimulation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('deve simular mudança de status: sending → sent', async () => {
    const mockOnStatusChange = vi.fn()
    const message = { id: 1, sender: 'agent', status: 'sending' }

    renderHook(() => useMessageStatusSimulation(message, mockOnStatusChange))

    vi.advanceTimersByTime(500)

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalledWith(1, 'sent')
    })
  })

  it('deve simular mudança de status: sent → delivered', async () => {
    const mockOnStatusChange = vi.fn()
    const message = { id: 1, sender: 'agent', status: 'sending' }

    renderHook(() => useMessageStatusSimulation(message, mockOnStatusChange))

    vi.advanceTimersByTime(1500)

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalledWith(1, 'delivered')
    })
  })

  it('deve simular mudança de status: delivered → read', async () => {
    const mockOnStatusChange = vi.fn()
    const message = { id: 1, sender: 'agent', status: 'sending' }

    renderHook(() => useMessageStatusSimulation(message, mockOnStatusChange))

    vi.advanceTimersByTime(5000)

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalledWith(1, 'read')
    })
  })

  it('não deve simular status para mensagens de customer', async () => {
    const mockOnStatusChange = vi.fn()
    const message = { id: 1, sender: 'customer', status: 'sending' }

    renderHook(() => useMessageStatusSimulation(message, mockOnStatusChange))

    vi.advanceTimersByTime(6000)

    expect(mockOnStatusChange).not.toHaveBeenCalled()
  })

  it('não deve simular status sem mensagem', async () => {
    const mockOnStatusChange = vi.fn()

    renderHook(() => useMessageStatusSimulation(null, mockOnStatusChange))

    vi.advanceTimersByTime(6000)

    expect(mockOnStatusChange).not.toHaveBeenCalled()
  })

  it('deve limpar timers ao desmontar', async () => {
    const mockOnStatusChange = vi.fn()
    const message = { id: 1, sender: 'agent', status: 'sending' }

    const { unmount } = renderHook(() => useMessageStatusSimulation(message, mockOnStatusChange))

    vi.advanceTimersByTime(100)

    unmount()

    vi.advanceTimersByTime(10000)

    // Não deve ter chamado após desmontar
    expect(mockOnStatusChange).not.toHaveBeenCalled()
  })
})
