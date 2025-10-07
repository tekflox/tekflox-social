import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AISuggestionCard from '../components/AISuggestionCard'

describe('AISuggestionCard', () => {
  const mockConversation = {
    id: 1,
    contact: {
      name: 'Maria Silva',
      platform: 'instagram'
    },
    platform: 'instagram',
    lastMessage: 'Vocês têm esse produto em estoque?',
    aiSuggestion: {
      text: 'Olá Maria! 😊 Sim, temos esse produto disponível em estoque.',
      tone: 'Profissional',
      confidence: 0.95
    }
  }

  const mockOnSendReply = vi.fn()

  beforeEach(() => {
    mockOnSendReply.mockClear()
  })

  it('renders AI suggestion card with customer message and AI suggestion', () => {
    render(
      <AISuggestionCard
        conversation={mockConversation}
        onSendReply={mockOnSendReply}
      />
    )

    expect(screen.getByText('MENSAGEM DO CLIENTE:')).toBeInTheDocument()
    expect(screen.getByText(mockConversation.lastMessage)).toBeInTheDocument()
    expect(screen.getByText('SUGESTÃO DA IA:')).toBeInTheDocument()
    expect(screen.getByText(mockConversation.aiSuggestion.text)).toBeInTheDocument()
    expect(screen.getByText('Tom: Profissional')).toBeInTheDocument()
    expect(screen.getByText('95% confiança')).toBeInTheDocument()
  })

  it('renders all three action buttons initially', () => {
    render(
      <AISuggestionCard
        conversation={mockConversation}
        onSendReply={mockOnSendReply}
      />
    )

    expect(screen.getByRole('button', { name: /Aceitar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Editar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Manual/i })).toBeInTheDocument()
  })

  it('calls onSendReply with ai_accepted when Accept button is clicked', async () => {
    render(
      <AISuggestionCard
        conversation={mockConversation}
        onSendReply={mockOnSendReply}
      />
    )

    const acceptButton = screen.getByRole('button', { name: /Aceitar/i })
    await userEvent.click(acceptButton)

    await waitFor(() => {
      expect(mockOnSendReply).toHaveBeenCalledWith(
        mockConversation.id,
        mockConversation.aiSuggestion.text,
        'ai_accepted'
      )
    })
  })

  it('switches to edit mode when Edit button is clicked', async () => {
    render(
      <AISuggestionCard
        conversation={mockConversation}
        onSendReply={mockOnSendReply}
      />
    )

    const editButton = screen.getByRole('button', { name: /Editar/i })
    await userEvent.click(editButton)

    // Should show textarea with AI suggestion text
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue(mockConversation.aiSuggestion.text)

    // Should show Cancel and Send buttons
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enviar/i })).toBeInTheDocument()
  })

  it('switches to manual mode when Manual button is clicked', async () => {
    render(
      <AISuggestionCard
        conversation={mockConversation}
        onSendReply={mockOnSendReply}
      />
    )

    const manualButton = screen.getByRole('button', { name: /Manual/i })
    await userEvent.click(manualButton)

    // Should show empty textarea
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('')

    // Should show Cancel and Send buttons
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument()
    
    // Send button should be disabled when textarea is empty
    const sendButton = screen.getByRole('button', { name: /Enviar/i })
    expect(sendButton).toBeDisabled()
  })

  it('allows editing AI suggestion and sending with ai_edited action type', async () => {
    render(
      <AISuggestionCard
        conversation={mockConversation}
        onSendReply={mockOnSendReply}
      />
    )

    // Click Edit button
    const editButton = screen.getByRole('button', { name: /Editar/i })
    await userEvent.click(editButton)

    // Modify the text
    const textarea = screen.getByRole('textbox')
    await userEvent.clear(textarea)
    const editedText = 'Olá Maria! Sim, temos em estoque com entrega rápida!'
    await userEvent.type(textarea, editedText)

    // Click Send
    const sendButton = screen.getByRole('button', { name: /Enviar/i })
    await userEvent.click(sendButton)

    await waitFor(() => {
      expect(mockOnSendReply).toHaveBeenCalledWith(
        mockConversation.id,
        editedText,
        'ai_edited'
      )
    })
  })

  it('allows typing manual response and sending with manual action type', async () => {
    render(
      <AISuggestionCard
        conversation={mockConversation}
        onSendReply={mockOnSendReply}
      />
    )

    // Click Manual button
    const manualButton = screen.getByRole('button', { name: /Manual/i })
    await userEvent.click(manualButton)

    // Type manual response
    const textarea = screen.getByRole('textbox')
    const manualText = 'Resposta completamente manual do agente'
    await userEvent.type(textarea, manualText)

    // Click Send
    const sendButton = screen.getByRole('button', { name: /Enviar/i })
    await userEvent.click(sendButton)

    await waitFor(() => {
      expect(mockOnSendReply).toHaveBeenCalledWith(
        mockConversation.id,
        manualText,
        'manual'
      )
    })
  })

  it('cancels edit mode when Cancel button is clicked', async () => {
    render(
      <AISuggestionCard
        conversation={mockConversation}
        onSendReply={mockOnSendReply}
      />
    )

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /Editar/i })
    await userEvent.click(editButton)

    // Click Cancel
    const cancelButton = screen.getByRole('button', { name: /Cancelar/i })
    await userEvent.click(cancelButton)

    // Should return to initial state with three action buttons
    expect(screen.getByRole('button', { name: /Aceitar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Editar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Manual/i })).toBeInTheDocument()
  })

  it('disables Send button while submitting', async () => {
    // Mock a slow async operation
    const slowMock = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(
      <AISuggestionCard
        conversation={mockConversation}
        onSendReply={slowMock}
      />
    )

    const acceptButton = screen.getByRole('button', { name: /Aceitar/i })
    await userEvent.click(acceptButton)

    // Button should be disabled during submission
    await waitFor(() => {
      expect(acceptButton).toBeDisabled()
    })
  })
})
