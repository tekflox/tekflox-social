import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import * as api from '../services/api'

vi.mock('axios')

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getConversations', () => {
    it('fetches conversations with platform filter', async () => {
      const mockData = [
        { id: 1, platform: 'instagram' },
        { id: 2, platform: 'facebook' }
      ]
      axios.get.mockResolvedValue({ data: mockData })

      const result = await api.getConversations(['instagram', 'facebook'])

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/conversations'),
        expect.objectContaining({
          params: { platforms: 'instagram,facebook' }
        })
      )
      expect(result).toEqual(mockData)
    })

    it('fetches all conversations when no platform filter provided', async () => {
      const mockData = [{ id: 1 }, { id: 2 }]
      axios.get.mockResolvedValue({ data: mockData })

      await api.getConversations([])

      expect(axios.get).toHaveBeenCalled()
    })
  })

  describe('sendMessage', () => {
    it('sends message with action type', async () => {
      const mockResponse = { data: { id: 10, text: 'Hello' } }
      axios.post.mockResolvedValue(mockResponse)

      const messageData = {
        conversationId: 1,
        text: 'Hello customer',
        actionType: 'ai_accepted'
      }

      const result = await api.sendMessage(messageData)

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/conversations/1/messages'),
        expect.objectContaining({
          text: 'Hello customer',
          actionType: 'ai_accepted'
        })
      )
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getAISuggestion', () => {
    it('fetches AI suggestion for conversation', async () => {
      const mockSuggestion = {
        text: 'Suggested response',
        tone: 'Professional',
        confidence: 0.95
      }
      axios.get.mockResolvedValue({ data: mockSuggestion })

      const result = await api.getAISuggestion(1)

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/ai/suggestion/1')
      )
      expect(result).toEqual(mockSuggestion)
    })
  })

  describe('linkConversation', () => {
    it('links conversation to customer', async () => {
      const mockResponse = { data: { success: true } }
      axios.post.mockResolvedValue(mockResponse)

      const linkData = {
        customerId: 5,
        customerName: 'John Doe'
      }

      await api.linkConversation(1, linkData)

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/conversations/1/link'),
        linkData
      )
    })

    it('links conversation to order', async () => {
      const mockResponse = { data: { success: true } }
      axios.post.mockResolvedValue(mockResponse)

      const linkData = {
        orderId: 101,
        orderNumber: '#101'
      }

      await api.linkConversation(1, linkData)

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/conversations/1/link'),
        linkData
      )
    })
  })

  describe('searchCustomers', () => {
    it('searches customers with query', async () => {
      const mockCustomers = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Doe' }
      ]
      axios.get.mockResolvedValue({ data: mockCustomers })

      const result = await api.searchCustomers('Doe')

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/customers'),
        expect.objectContaining({
          params: { search: 'Doe' }
        })
      )
      expect(result).toEqual(mockCustomers)
    })
  })

  describe('getDashboardStats', () => {
    it('fetches dashboard statistics', async () => {
      const mockStats = {
        total: 10,
        pending: 3,
        answered: 5,
        resolved: 2
      }
      axios.get.mockResolvedValue({ data: mockStats })

      const result = await api.getDashboardStats()

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/analytics/dashboard')
      )
      expect(result).toEqual(mockStats)
    })
  })

  describe('updateSettings', () => {
    it('updates settings with PATCH request', async () => {
      const mockSettings = {
        aiEnabled: true,
        autoReply: false
      }
      axios.patch.mockResolvedValue({ data: mockSettings })

      const result = await api.updateSettings(mockSettings)

      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/settings'),
        mockSettings
      )
      expect(result).toEqual(mockSettings)
    })
  })

  describe('error handling', () => {
    it('throws error when API request fails', async () => {
      const errorMessage = 'Network Error'
      axios.get.mockRejectedValue(new Error(errorMessage))

      await expect(api.getConversations()).rejects.toThrow(errorMessage)
    })
  })
})
