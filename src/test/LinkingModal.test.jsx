import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LinkingModal from '../components/LinkingModal'
import * as api from '../services/api'

// Mock the API
vi.mock('../services/api', () => ({
  searchCustomers: vi.fn(),
  searchOrders: vi.fn(),
  searchWordPressAccounts: vi.fn()
}))

describe('LinkingModal', () => {
  const mockConversation = {
    id: 1,
    contact: { name: 'Maria Silva' }
  }

  const mockCustomers = [
    { id: 1, name: 'Maria Silva', email: 'maria@example.com' },
    { id: 2, name: 'João Santos', email: 'joao@example.com' }
  ]

  const mockOrders = [
    { id: 101, customerName: 'Maria Silva', total: 'R$ 150,00', status: 'completed' },
    { id: 102, customerName: 'João Santos', total: 'R$ 200,00', status: 'processing' }
  ]

  const mockWPAccounts = [
    { id: 1, username: 'maria.silva', email: 'maria@example.com', role: 'customer' },
    { id: 2, username: 'joao.santos', email: 'joao@example.com', role: 'customer' }
  ]

  const mockOnClose = vi.fn()
  const mockOnLink = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    api.searchCustomers.mockResolvedValue(mockCustomers)
    api.searchOrders.mockResolvedValue(mockOrders)
    api.searchWordPressAccounts.mockResolvedValue(mockWPAccounts)
  })

  it('renders modal with three tabs', () => {
    render(
      <LinkingModal
        conversation={mockConversation}
        onClose={mockOnClose}
        onLink={mockOnLink}
      />
    )

    expect(screen.getByText('Vincular Conversa')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Cliente/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Pedido/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Conta WP/i })).toBeInTheDocument()
  })

  it('loads and displays customers on initial render', async () => {
    render(
      <LinkingModal
        conversation={mockConversation}
        onClose={mockOnClose}
        onLink={mockOnLink}
      />
    )

    await waitFor(() => {
      expect(api.searchCustomers).toHaveBeenCalledWith('')
      expect(screen.getByText('Maria Silva')).toBeInTheDocument()
      expect(screen.getByText('João Santos')).toBeInTheDocument()
    })
  })

  it('switches to orders tab and loads orders', async () => {
    render(
      <LinkingModal
        conversation={mockConversation}
        onClose={mockOnClose}
        onLink={mockOnLink}
      />
    )

    const ordersTab = screen.getByRole('tab', { name: /Pedido/i })
    await userEvent.click(ordersTab)

    await waitFor(() => {
      expect(api.searchOrders).toHaveBeenCalledWith('')
      expect(screen.getByText(/Pedido #101/i)).toBeInTheDocument()
      expect(screen.getByText(/R\$ 150,00/)).toBeInTheDocument()
    })
  })

  it('switches to WordPress accounts tab and loads accounts', async () => {
    render(
      <LinkingModal
        conversation={mockConversation}
        onClose={mockOnClose}
        onLink={mockOnLink}
      />
    )

    const wpTab = screen.getByRole('tab', { name: /Conta WP/i })
    await userEvent.click(wpTab)

    await waitFor(() => {
      expect(api.searchWordPressAccounts).toHaveBeenCalledWith('')
      expect(screen.getByText('maria.silva')).toBeInTheDocument()
      expect(screen.getByText('joao.santos')).toBeInTheDocument()
    })
  })

  it('filters customers based on search input', async () => {
    api.searchCustomers
      .mockResolvedValueOnce(mockCustomers)
      .mockResolvedValueOnce([mockCustomers[0]])

    render(
      <LinkingModal
        conversation={mockConversation}
        onClose={mockOnClose}
        onLink={mockOnLink}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Maria Silva')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Buscar/i)
    await userEvent.type(searchInput, 'Maria')

    await waitFor(() => {
      expect(api.searchCustomers).toHaveBeenCalledWith('Maria')
    })
  })

  it('selects a customer and enables Link button', async () => {
    render(
      <LinkingModal
        conversation={mockConversation}
        onClose={mockOnClose}
        onLink={mockOnLink}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Maria Silva')).toBeInTheDocument()
    })

    // Click on Maria Silva
    const mariaItem = screen.getByText('Maria Silva').closest('div')
    await userEvent.click(mariaItem)

    // Link button should be enabled
    const linkButton = screen.getByRole('button', { name: /Vincular/i })
    expect(linkButton).not.toBeDisabled()
  })

  it('calls onLink with correct data when Link button is clicked', async () => {
    render(
      <LinkingModal
        conversation={mockConversation}
        onClose={mockOnClose}
        onLink={mockOnLink}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Maria Silva')).toBeInTheDocument()
    })

    // Select Maria Silva
    const mariaItem = screen.getByText('Maria Silva').closest('div')
    await userEvent.click(mariaItem)

    // Click Link button
    const linkButton = screen.getByRole('button', { name: /Vincular/i })
    await userEvent.click(linkButton)

    expect(mockOnLink).toHaveBeenCalledWith({
      customerId: 1,
      customerName: 'Maria Silva'
    })
  })

  it('calls onClose when Cancel button is clicked', async () => {
    render(
      <LinkingModal
        conversation={mockConversation}
        onClose={mockOnClose}
        onLink={mockOnLink}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /Cancelar/i })
    await userEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking outside modal', async () => {
    const { container } = render(
      <LinkingModal
        conversation={mockConversation}
        onClose={mockOnClose}
        onLink={mockOnLink}
      />
    )

    // Click on modal backdrop
    const backdrop = container.firstChild
    await userEvent.click(backdrop)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows loading state while fetching data', () => {
    api.searchCustomers.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockCustomers), 1000))
    )

    render(
      <LinkingModal
        conversation={mockConversation}
        onClose={mockOnClose}
        onLink={mockOnLink}
      />
    )

    expect(screen.getByText(/Carregando/i)).toBeInTheDocument()
  })

  it('shows empty state when no results found', async () => {
    api.searchCustomers.mockResolvedValue([])

    render(
      <LinkingModal
        conversation={mockConversation}
        onClose={mockOnClose}
        onLink={mockOnLink}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Nenhum resultado encontrado/i)).toBeInTheDocument()
    })
  })
})
