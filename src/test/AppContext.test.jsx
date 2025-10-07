import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AppProvider, useApp } from '../contexts/AppContext'
import * as api from '../services/api'

vi.mock('../services/api')

describe('AppContext', () => {
  const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides initial state', () => {
    const { result } = renderHook(() => useApp(), { wrapper })

    expect(result.current.state).toMatchObject({
      user: null,
      conversations: [],
      selectedConversation: null,
      conversationMessages: [],
      loading: false,
      error: null,
      selectedPlatforms: [],
      statusFilter: 'all',
      pendingConversations: []
    })
  })

  describe('loadConversations', () => {
    it('loads conversations successfully', async () => {
      const mockConversations = [
        { id: 1, platform: 'instagram' },
        { id: 2, platform: 'facebook' }
      ]
      api.getConversations.mockResolvedValue(mockConversations)

      const { result } = renderHook(() => useApp(), { wrapper })

      await act(async () => {
        await result.current.loadConversations()
      })

      await waitFor(() => {
        expect(result.current.state.conversations).toEqual(mockConversations)
        expect(result.current.state.loading).toBe(false)
      })
    })

    it('sets error on failure', async () => {
      const errorMessage = 'Failed to load'
      api.getConversations.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useApp(), { wrapper })

      await act(async () => {
        await result.current.loadConversations()
      })

      await waitFor(() => {
        expect(result.current.state.error).toBe(errorMessage)
        expect(result.current.state.loading).toBe(false)
      })
    })
  })

  describe('sendMessage', () => {
    it('sends message and updates conversation', async () => {
      const mockMessage = {
        id: 10,
        text: 'Hello',
        actionType: 'ai_accepted'
      }
      api.sendMessage.mockResolvedValue(mockMessage)
      api.updateConversation.mockResolvedValue({ success: true })

      const { result } = renderHook(() => useApp(), { wrapper })

      await act(async () => {
        await result.current.sendMessage(1, 'Hello', 'ai_accepted')
      })

      await waitFor(() => {
        expect(api.sendMessage).toHaveBeenCalledWith({
          conversationId: 1,
          text: 'Hello',
          actionType: 'ai_accepted'
        })
        expect(api.updateConversation).toHaveBeenCalledWith(1, {
          status: 'answered',
          unread: false
        })
      })
    })
  })

  describe('selectConversation', () => {
    it('selects conversation and loads messages', async () => {
      const mockConversation = { id: 1, platform: 'instagram' }
      const mockMessages = [
        { id: 1, text: 'Message 1' },
        { id: 2, text: 'Message 2' }
      ]
      api.getConversation.mockResolvedValue(mockConversation)
      api.getMessages.mockResolvedValue(mockMessages)

      const { result } = renderHook(() => useApp(), { wrapper })

      await act(async () => {
        await result.current.selectConversation(1)
      })

      await waitFor(() => {
        expect(result.current.state.selectedConversation).toEqual(mockConversation)
        expect(result.current.state.conversationMessages).toEqual(mockMessages)
      })
    })
  })

  describe('linkConversationToEntity', () => {
    it('links conversation to customer', async () => {
      api.linkConversation.mockResolvedValue({ success: true })
      api.getConversation.mockResolvedValue({
        id: 1,
        linkedCustomer: { id: 5, name: 'John Doe' }
      })

      const { result } = renderHook(() => useApp(), { wrapper })

      const linkData = {
        customerId: 5,
        customerName: 'John Doe'
      }

      await act(async () => {
        await result.current.linkConversationToEntity(1, linkData)
      })

      await waitFor(() => {
        expect(api.linkConversation).toHaveBeenCalledWith(1, linkData)
        expect(api.getConversation).toHaveBeenCalledWith(1)
      })
    })
  })

  describe('loadPendingConversations', () => {
    it('loads pending conversations with AI suggestions', async () => {
      const mockPending = [
        {
          id: 1,
          status: 'pending',
          aiSuggestion: { text: 'Suggestion 1' }
        },
        {
          id: 2,
          status: 'pending',
          aiSuggestion: { text: 'Suggestion 2' }
        }
      ]
      api.getPendingWithSuggestions.mockResolvedValue(mockPending)

      const { result } = renderHook(() => useApp(), { wrapper })

      await act(async () => {
        await result.current.loadPendingConversations()
      })

      await waitFor(() => {
        expect(result.current.state.pendingConversations).toEqual(mockPending)
      })
    })
  })

  describe('loadDashboardStats', () => {
    it('loads dashboard statistics', async () => {
      const mockStats = {
        total: 10,
        pending: 3,
        answered: 5,
        resolved: 2
      }
      api.getDashboardStats.mockResolvedValue(mockStats)

      const { result } = renderHook(() => useApp(), { wrapper })

      await act(async () => {
        await result.current.loadDashboardStats()
      })

      await waitFor(() => {
        expect(result.current.state.dashboardStats).toEqual(mockStats)
      })
    })
  })

  describe('updateSettings', () => {
    it('updates settings', async () => {
      const newSettings = {
        aiEnabled: true,
        autoReply: false
      }
      api.updateSettings.mockResolvedValue(newSettings)

      const { result } = renderHook(() => useApp(), { wrapper })

      await act(async () => {
        await result.current.updateSettings(newSettings)
      })

      await waitFor(() => {
        expect(result.current.state.settings).toEqual(newSettings)
      })
    })
  })

  describe('platform filter', () => {
    it('toggles platform filter', () => {
      const { result } = renderHook(() => useApp(), { wrapper })

      act(() => {
        result.current.dispatch({
          type: 'TOGGLE_PLATFORM',
          payload: 'instagram'
        })
      })

      expect(result.current.state.selectedPlatforms).toContain('instagram')

      act(() => {
        result.current.dispatch({
          type: 'TOGGLE_PLATFORM',
          payload: 'instagram'
        })
      })

      expect(result.current.state.selectedPlatforms).not.toContain('instagram')
    })
  })

  describe('status filter', () => {
    it('sets status filter', () => {
      const { result } = renderHook(() => useApp(), { wrapper })

      act(() => {
        result.current.dispatch({
          type: 'SET_STATUS_FILTER',
          payload: 'pending'
        })
      })

      expect(result.current.state.statusFilter).toBe('pending')
    })
  })
})
