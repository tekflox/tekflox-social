import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ConversationCard from '../components/ConversationCard'

describe('ConversationCard', () => {
  const mockConversation = {
    id: 1,
    contact: {
      name: 'João Silva'
    },
    platform: 'whatsapp',
    timeAgo: '5 min atrás',
    lastMessage: 'Olá, preciso de ajuda com meu pedido',
    aiSuggestion: 'Olá João! Como posso ajudá-lo com seu pedido?',
    aiSummary: 'Cliente perguntando sobre pedido',
    order: {
      id: '12345'
    }
  }

  const mockOnReply = vi.fn()

  beforeEach(() => {
    mockOnReply.mockClear()
  })

  it('deve renderizar informações da conversa', () => {
    render(<ConversationCard conversation={mockConversation} onReply={mockOnReply} />)

    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('whatsapp')).toBeInTheDocument()
    expect(screen.getByText('5 min atrás')).toBeInTheDocument()
    expect(screen.getByText('Olá, preciso de ajuda com meu pedido')).toBeInTheDocument()
    expect(screen.getByText('Pedido #12345')).toBeInTheDocument()
  })

  it('deve renderizar resumo AI quando disponível', () => {
    render(<ConversationCard conversation={mockConversation} onReply={mockOnReply} />)

    expect(screen.getByText('Resumo AI')).toBeInTheDocument()
    expect(screen.getByText('Cliente perguntando sobre pedido')).toBeInTheDocument()
  })

  it('deve mostrar sugestão AI por padrão', () => {
    render(<ConversationCard conversation={mockConversation} onReply={mockOnReply} />)

    const textarea = screen.getByPlaceholderText('Digite sua resposta...')
    expect(textarea).toHaveValue('Olá João! Como posso ajudá-lo com seu pedido?')
    expect(textarea).toHaveAttribute('readOnly')
  })

  it('deve alternar para modo edição', () => {
    render(<ConversationCard conversation={mockConversation} onReply={mockOnReply} />)

    const editButton = screen.getByRole('button', { name: /Editar/i })
    fireEvent.click(editButton)

    const textarea = screen.getByPlaceholderText('Digite sua resposta...')
    expect(textarea).not.toHaveAttribute('readOnly')
  })

  it('deve alternar para modo manual', () => {
    render(<ConversationCard conversation={mockConversation} onReply={mockOnReply} />)

    const manualButton = screen.getByRole('button', { name: /Manual/i })
    fireEvent.click(manualButton)

    const textarea = screen.getByPlaceholderText('Digite sua resposta...')
    expect(textarea).toHaveValue('')
    expect(textarea).not.toHaveAttribute('readOnly')
  })

  it('deve permitir editar texto da resposta', () => {
    render(<ConversationCard conversation={mockConversation} onReply={mockOnReply} />)

    const editButton = screen.getByRole('button', { name: /Editar/i })
    fireEvent.click(editButton)

    const textarea = screen.getByPlaceholderText('Digite sua resposta...')
    fireEvent.change(textarea, { target: { value: 'Nova resposta editada' } })

    expect(textarea).toHaveValue('Nova resposta editada')
  })

  it('deve enviar resposta com informações corretas', async () => {
    render(<ConversationCard conversation={mockConversation} onReply={mockOnReply} />)

    const sendButton = screen.getByRole('button', { name: /Enviar Resposta/i })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(mockOnReply).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: 1,
          text: 'Olá João! Como posso ajudá-lo com seu pedido?',
          mode: 'suggestion'
        })
      )
    })
  })

  it('deve enviar resposta editada', async () => {
    render(<ConversationCard conversation={mockConversation} onReply={mockOnReply} />)

    const editButton = screen.getByRole('button', { name: /Editar/i })
    fireEvent.click(editButton)

    const textarea = screen.getByPlaceholderText('Digite sua resposta...')
    fireEvent.change(textarea, { target: { value: 'Resposta customizada' } })

    const sendButton = screen.getByRole('button', { name: /Enviar Resposta/i })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(mockOnReply).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Resposta customizada',
          mode: 'edit'
        })
      )
    })
  })

  it('não deve renderizar badge de pedido quando não houver pedido', () => {
    const conversationWithoutOrder = { ...mockConversation, order: null }
    render(<ConversationCard conversation={conversationWithoutOrder} onReply={mockOnReply} />)

    expect(screen.queryByText(/Pedido #/)).not.toBeInTheDocument()
  })

  it('não deve renderizar resumo AI quando não houver', () => {
    const conversationWithoutSummary = { ...mockConversation, aiSummary: null }
    render(<ConversationCard conversation={conversationWithoutSummary} onReply={mockOnReply} />)

    expect(screen.queryByText('Resumo AI')).not.toBeInTheDocument()
  })
})
