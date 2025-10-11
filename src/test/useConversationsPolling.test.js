import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useConversationsPolling } from '../hooks/useConversationsPolling'
import * as api from '../services/api'

vi.mock('../services/api')

describe('useConversationsPolling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  const mockConversations = [
    {
      id: 1,
      contact: { name: 'João Silva' },
      lastMessage: 'Olá',
      timestamp: '2025-10-11T10:00:00',
      unread: true,
      status: 'pending'
    },
    {
      id: 2,
      contact: { name: 'Maria Santos' },
      lastMessage: 'Boa tarde',
      timestamp: '2025-10-11T09:00:00',
      unread: false,
      status: 'answered'
    }
  ]

  it('deve iniciar polling quando enabled', async () => {
    const mockOnUpdate = vi.fn()
    api.getConversations.mockResolvedValue(mockConversations)

    renderHook(() => useConversationsPolling(mockOnUpdate, true, 10000))

    await waitFor(() => {
      expect(api.getConversations).toHaveBeenCalled()
    })
  })

  it('não deve iniciar polling quando disabled', async () => {
    const mockOnUpdate = vi.fn()

    renderHook(() => useConversationsPolling(mockOnUpdate, false, 10000))

    vi.advanceTimersByTime(15000)

    expect(api.getConversations).not.toHaveBeenCalled()
  })

  it('deve fazer polling no intervalo especificado', async () => {
    const mockOnUpdate = vi.fn()
    api.getConversations.mockResolvedValue(mockConversations)

    renderHook(() => useConversationsPolling(mockOnUpdate, true, 10000))

    await waitFor(() => {
      expect(api.getConversations).toHaveBeenCalledTimes(1)
    })

    vi.advanceTimersByTime(10000)

    await waitFor(() => {
      expect(api.getConversations).toHaveBeenCalledTimes(2)
    })

    vi.advanceTimersByTime(10000)

    await waitFor(() => {
      expect(api.getConversations).toHaveBeenCalledTimes(3)
    })
  })

  it('deve detectar mudanças nas conversas', async () => {
    const mockOnUpdate = vi.fn()

    // Primeira chamada - conversas iniciais
    api.getConversations.mockResolvedValueOnce(mockConversations)

    const { rerender } = renderHook(() => useConversationsPolling(mockOnUpdate, true, 10000))

    await waitFor(() => {
      expect(api.getConversations).toHaveBeenCalled()
    })

    // Primeira carga não deve notificar
    expect(mockOnUpdate).not.toHaveBeenCalled()

    // Segunda chamada - conversas alteradas
    const updatedConversations = [
      ...mockConversations,
      {
        id: 3,
        contact: { name: 'Pedro Costa' },
        lastMessage: 'Nova mensagem',
        timestamp: '2025-10-11T11:00:00',
        unread: true,
        status: 'pending'
      }
    ]

    api.getConversations.mockResolvedValueOnce(updatedConversations)

    vi.advanceTimersByTime(10000)

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(updatedConversations)
    })
  })

  it('não deve notificar quando não houver mudanças', async () => {
    const mockOnUpdate = vi.fn()
    api.getConversations.mockResolvedValue(mockConversations)

    renderHook(() => useConversationsPolling(mockOnUpdate, true, 10000))

    await waitFor(() => {
      expect(api.getConversations).toHaveBeenCalledTimes(1)
    })

    vi.advanceTimersByTime(10000)

    await waitFor(() => {
      expect(api.getConversations).toHaveBeenCalledTimes(2)
    })

    // Deve ter chamado onUpdate zero vezes (primeira carga não notifica, segunda sem mudanças)
    expect(mockOnUpdate).not.toHaveBeenCalled()
  })

  it('deve detectar mudança em lastMessage', async () => {
    const mockOnUpdate = vi.fn()

    api.getConversations.mockResolvedValueOnce(mockConversations)

    renderHook(() => useConversationsPolling(mockOnUpdate, true, 10000))

    await waitFor(() => {
      expect(api.getConversations).toHaveBeenCalled()
    })

    // Altera lastMessage de uma conversa
    const updatedConversations = mockConversations.map(conv =>
      conv.id === 1
        ? { ...conv, lastMessage: 'Mensagem atualizada' }
        : conv
    )

    api.getConversations.mockResolvedValueOnce(updatedConversations)

    vi.advanceTimersByTime(10000)

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(updatedConversations)
    })
  })

  it('deve detectar mudança em status unread', async () => {
    const mockOnUpdate = vi.fn()

    api.getConversations.mockResolvedValueOnce(mockConversations)

    renderHook(() => useConversationsPolling(mockOnUpdate, true, 10000))

    await waitFor(() => {
      expect(api.getConversations).toHaveBeenCalled()
    })

    // Marca conversa como lida
    const updatedConversations = mockConversations.map(conv =>
      conv.id === 1
        ? { ...conv, unread: false }
        : conv
    )

    api.getConversations.mockResolvedValueOnce(updatedConversations)

    vi.advanceTimersByTime(10000)

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(updatedConversations)
    })
  })

  it('deve retornar funções de controle', () => {
    const mockOnUpdate = vi.fn()
    api.getConversations.mockResolvedValue(mockConversations)

    const { result } = renderHook(() => useConversationsPolling(mockOnUpdate, true, 10000))

    expect(result.current).toHaveProperty('isPolling')
    expect(result.current).toHaveProperty('lastCheck')
    expect(result.current).toHaveProperty('forceCheck')
    expect(typeof result.current.forceCheck).toBe('function')
  })

  it('deve permitir forçar check imediato', async () => {
    const mockOnUpdate = vi.fn()
    api.getConversations.mockResolvedValue(mockConversations)

    const { result } = renderHook(() => useConversationsPolling(mockOnUpdate, true, 10000))

    await waitFor(() => {
      expect(api.getConversations).toHaveBeenCalledTimes(1)
    })

    // Força check
    result.current.forceCheck()

    await waitFor(() => {
      expect(api.getConversations).toHaveBeenCalledTimes(2)
    })
  })

  it('deve continuar polling após erro', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const mockOnUpdate = vi.fn()

    // Primeira chamada falha
    api.getConversations.mockRejectedValueOnce(new Error('Network error'))

    renderHook(() => useConversationsPolling(mockOnUpdate, true, 10000))

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Conversations Polling] Error:',
        expect.any(Error)
      )
    })

    // Segunda chamada tem sucesso
    api.getConversations.mockResolvedValueOnce(mockConversations)

    vi.advanceTimersByTime(10000)

    await waitFor(() => {
      expect(api.getConversations).toHaveBeenCalledTimes(2)
    })

    consoleErrorSpy.mockRestore()
  })

  it('deve limpar intervalo ao desmontar', async () => {
    const mockOnUpdate = vi.fn()
    api.getConversations.mockResolvedValue(mockConversations)

    const { unmount } = renderHook(() => useConversationsPolling(mockOnUpdate, true, 10000))

    await waitFor(() => {
      expect(api.getConversations).toHaveBeenCalledTimes(1)
    })

    const callCount = api.getConversations.mock.calls.length

    unmount()

    vi.advanceTimersByTime(30000)

    // Não deve ter chamado após desmontar
    expect(api.getConversations).toHaveBeenCalledTimes(callCount)
  })

  it('deve atualizar lastCheck após cada polling', async () => {
    const mockOnUpdate = vi.fn()
    api.getConversations.mockResolvedValue(mockConversations)

    const { result } = renderHook(() => useConversationsPolling(mockOnUpdate, true, 10000))

    await waitFor(() => {
      expect(result.current.lastCheck).not.toBeNull()
    })

    const firstCheck = result.current.lastCheck

    vi.advanceTimersByTime(10000)

    await waitFor(() => {
      expect(result.current.lastCheck).not.toBe(firstCheck)
    })
  })

  it('deve logar informações de polling no console', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const mockOnUpdate = vi.fn()
    api.getConversations.mockResolvedValue(mockConversations)

    renderHook(() => useConversationsPolling(mockOnUpdate, true, 10000))

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Conversations Polling] Started')
      )
    })

    consoleLogSpy.mockRestore()
  })
})
