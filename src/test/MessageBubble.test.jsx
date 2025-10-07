import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MessageBubble from '../components/MessageBubble'

describe('MessageBubble', () => {
  it('renders customer message with correct styling', () => {
    const customerMessage = {
      id: 1,
      text: 'Hello, I have a question',
      sender: 'customer',
      timestamp: new Date('2024-01-15T10:30:00'),
      actionType: null
    }

    render(<MessageBubble message={customerMessage} />)

    expect(screen.getByText('Hello, I have a question')).toBeInTheDocument()
    const messageElement = screen.getByText('Hello, I have a question').closest('div')
    expect(messageElement).toHaveClass('bg-white')
  })

  it('renders agent message with correct styling', () => {
    const agentMessage = {
      id: 2,
      text: 'How can I help you?',
      sender: 'agent',
      timestamp: new Date('2024-01-15T10:31:00'),
      actionType: 'manual'
    }

    render(<MessageBubble message={agentMessage} />)

    expect(screen.getByText('How can I help you?')).toBeInTheDocument()
    const messageElement = screen.getByText('How can I help you?').closest('div')
    expect(messageElement).toHaveClass('ai-gradient')
  })

  it('displays AI accepted action type label', () => {
    const message = {
      id: 3,
      text: 'Response text',
      sender: 'agent',
      timestamp: new Date(),
      actionType: 'ai_accepted'
    }

    render(<MessageBubble message={message} />)

    expect(screen.getByText('✨ IA Aceita')).toBeInTheDocument()
  })

  it('displays AI edited action type label', () => {
    const message = {
      id: 4,
      text: 'Response text',
      sender: 'agent',
      timestamp: new Date(),
      actionType: 'ai_edited'
    }

    render(<MessageBubble message={message} />)

    expect(screen.getByText('✏️ IA Editada')).toBeInTheDocument()
  })

  it('displays manual action type label', () => {
    const message = {
      id: 5,
      text: 'Response text',
      sender: 'agent',
      timestamp: new Date(),
      actionType: 'manual'
    }

    render(<MessageBubble message={message} />)

    expect(screen.getByText('📝 Manual')).toBeInTheDocument()
  })

  it('formats timestamp correctly', () => {
    const message = {
      id: 6,
      text: 'Test message',
      sender: 'customer',
      timestamp: new Date('2024-01-15T14:30:00'),
      actionType: null
    }

    render(<MessageBubble message={message} />)

    // Check that time is displayed (format: HH:mm)
    expect(screen.getByText(/14:30|2:30/)).toBeInTheDocument()
  })

  it('shows checkmark icon for agent messages', () => {
    const message = {
      id: 7,
      text: 'Agent message',
      sender: 'agent',
      timestamp: new Date(),
      actionType: 'manual'
    }

    const { container } = render(<MessageBubble message={message} />)

    // Check for lucide-react CheckCheck icon
    const icon = container.querySelector('[data-lucide="check-check"]') || 
                 container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('does not show action type label for customer messages', () => {
    const message = {
      id: 8,
      text: 'Customer message',
      sender: 'customer',
      timestamp: new Date(),
      actionType: null
    }

    const { container } = render(<MessageBubble message={message} />)

    expect(screen.queryByText(/IA Aceita|IA Editada|Manual/)).not.toBeInTheDocument()
  })
})
