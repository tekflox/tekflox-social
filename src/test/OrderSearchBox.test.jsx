import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OrderSearchBox from '../components/OrderSearchBox'
import * as api from '../services/api'

vi.mock('../services/api')

describe('OrderSearchBox', () => {
  const mockOrders = [
    {
      id: 1,
      orderNumber: '12345',
      customerName: 'João Silva',
      customerEmail: 'joao@email.com',
      status: 'completed',
      total: 299.90,
      date: '2025-10-10T10:00:00',
      items: [{ name: 'Produto 1' }]
    },
    {
      id: 2,
      orderNumber: '12346',
      customerName: 'Maria Santos',
      customerEmail: 'maria@email.com',
      status: 'processing',
      total: 150.00,
      date: '2025-10-09T15:30:00',
      items: [{ name: 'Produto 2' }, { name: 'Produto 3' }]
    }
  ]

  const mockOnSelectOrder = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('deve renderizar input de busca', () => {
    render(<OrderSearchBox onSelectOrder={mockOnSelectOrder} onClose={mockOnClose} />)

    expect(screen.getByPlaceholderText(/Buscar por nome, email ou número do pedido/i)).toBeInTheDocument()
  })

  it('deve mostrar loading durante busca', async () => {
    api.searchOrdersAutocomplete.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockOrders), 500)))

    render(<OrderSearchBox onSelectOrder={mockOnSelectOrder} onClose={mockOnClose} />)

    const input = screen.getByPlaceholderText(/Buscar por nome, email ou número do pedido/i)
    fireEvent.change(input, { target: { value: 'João' } })

    // Avança o tempo para o debounce começar
    vi.advanceTimersByTime(100)

    await waitFor(() => {
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument() // Loader icon
    })

    vi.advanceTimersByTime(500)
  })

  it('deve fazer busca com debounce de 300ms', async () => {
    api.searchOrdersAutocomplete.mockResolvedValue(mockOrders)

    render(<OrderSearchBox onSelectOrder={mockOnSelectOrder} onClose={mockOnClose} />)

    const input = screen.getByPlaceholderText(/Buscar por nome, email ou número do pedido/i)
    fireEvent.change(input, { target: { value: 'João' } })

    // Não deve chamar API imediatamente
    expect(api.searchOrdersAutocomplete).not.toHaveBeenCalled()

    // Avança 300ms (debounce)
    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(api.searchOrdersAutocomplete).toHaveBeenCalledWith('João')
    })
  })

  it('deve exibir resultados da busca', async () => {
    api.searchOrdersAutocomplete.mockResolvedValue(mockOrders)

    render(<OrderSearchBox onSelectOrder={mockOnSelectOrder} onClose={mockOnClose} />)

    const input = screen.getByPlaceholderText(/Buscar por nome, email ou número do pedido/i)
    fireEvent.change(input, { target: { value: 'Silva' } })

    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.getByText('joao@email.com')).toBeInTheDocument()
      expect(screen.getByText('#12345')).toBeInTheDocument()
      expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    })
  })

  it('deve formatar moeda brasileira corretamente', async () => {
    api.searchOrdersAutocomplete.mockResolvedValue(mockOrders)

    render(<OrderSearchBox onSelectOrder={mockOnSelectOrder} onClose={mockOnClose} />)

    const input = screen.getByPlaceholderText(/Buscar por nome, email ou número do pedido/i)
    fireEvent.change(input, { target: { value: 'Silva' } })

    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(screen.getByText('R$ 299,90')).toBeInTheDocument()
      expect(screen.getByText('R$ 150,00')).toBeInTheDocument()
    })
  })

  it('deve exibir status colorido corretamente', async () => {
    api.searchOrdersAutocomplete.mockResolvedValue(mockOrders)

    render(<OrderSearchBox onSelectOrder={mockOnSelectOrder} onClose={mockOnClose} />)

    const input = screen.getByPlaceholderText(/Buscar por nome, email ou número do pedido/i)
    fireEvent.change(input, { target: { value: 'Silva' } })

    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(screen.getByText('Concluído')).toBeInTheDocument()
      expect(screen.getByText('Processando')).toBeInTheDocument()
    })
  })

  it('deve exibir contagem de itens', async () => {
    api.searchOrdersAutocomplete.mockResolvedValue(mockOrders)

    render(<OrderSearchBox onSelectOrder={mockOnSelectOrder} onClose={mockOnClose} />)

    const input = screen.getByPlaceholderText(/Buscar por nome, email ou número do pedido/i)
    fireEvent.change(input, { target: { value: 'Silva' } })

    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(screen.getByText('1 item')).toBeInTheDocument()
      expect(screen.getByText('2 itens')).toBeInTheDocument()
    })
  })

  it('deve chamar onSelectOrder ao clicar em pedido', async () => {
    api.searchOrdersAutocomplete.mockResolvedValue(mockOrders)

    render(<OrderSearchBox onSelectOrder={mockOnSelectOrder} onClose={mockOnClose} />)

    const input = screen.getByPlaceholderText(/Buscar por nome, email ou número do pedido/i)
    fireEvent.change(input, { target: { value: 'Silva' } })

    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    const orderButton = screen.getByText('João Silva').closest('button')
    fireEvent.click(orderButton)

    expect(mockOnSelectOrder).toHaveBeenCalledWith(mockOrders[0])
  })

  it('deve limpar busca após selecionar pedido', async () => {
    api.searchOrdersAutocomplete.mockResolvedValue(mockOrders)

    render(<OrderSearchBox onSelectOrder={mockOnSelectOrder} onClose={mockOnClose} />)

    const input = screen.getByPlaceholderText(/Buscar por nome, email ou número do pedido/i)
    fireEvent.change(input, { target: { value: 'Silva' } })

    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    const orderButton = screen.getByText('João Silva').closest('button')
    fireEvent.click(orderButton)

    expect(input).toHaveValue('')
  })

  it('deve exibir mensagem quando não houver resultados', async () => {
    api.searchOrdersAutocomplete.mockResolvedValue([])

    render(<OrderSearchBox onSelectOrder={mockOnSelectOrder} onClose={mockOnClose} />)

    const input = screen.getByPlaceholderText(/Buscar por nome, email ou número do pedido/i)
    fireEvent.change(input, { target: { value: 'XYZ999' } })

    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(screen.getByText('Nenhum pedido encontrado')).toBeInTheDocument()
    })
  })

  it('deve limpar resultados quando query ficar vazia', async () => {
    api.searchOrdersAutocomplete.mockResolvedValue(mockOrders)

    render(<OrderSearchBox onSelectOrder={mockOnSelectOrder} onClose={mockOnClose} />)

    const input = screen.getByPlaceholderText(/Buscar por nome, email ou número do pedido/i)

    // Busca inicial
    fireEvent.change(input, { target: { value: 'Silva' } })
    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    // Limpa input
    fireEvent.change(input, { target: { value: '' } })

    await waitFor(() => {
      expect(screen.queryByText('João Silva')).not.toBeInTheDocument()
    })
  })

  it('deve fechar dropdown ao clicar fora', async () => {
    api.searchOrdersAutocomplete.mockResolvedValue(mockOrders)

    const { container } = render(
      <div>
        <OrderSearchBox onSelectOrder={mockOnSelectOrder} onClose={mockOnClose} />
        <div data-testid="outside">Outside element</div>
      </div>
    )

    const input = screen.getByPlaceholderText(/Buscar por nome, email ou número do pedido/i)
    fireEvent.change(input, { target: { value: 'Silva' } })

    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    // Clica fora
    const outsideElement = screen.getByTestId('outside')
    fireEvent.mouseDown(outsideElement)

    await waitFor(() => {
      expect(screen.queryByText('João Silva')).not.toBeInTheDocument()
    })
  })

  it('deve chamar onClose ao clicar no botão fechar', () => {
    render(<OrderSearchBox onSelectOrder={mockOnSelectOrder} onClose={mockOnClose} />)

    const closeButton = screen.getByRole('button', { hidden: true })
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('deve tratar erro na busca graciosamente', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    api.searchOrdersAutocomplete.mockRejectedValue(new Error('API Error'))

    render(<OrderSearchBox onSelectOrder={mockOnSelectOrder} onClose={mockOnClose} />)

    const input = screen.getByPlaceholderText(/Buscar por nome, email ou número do pedido/i)
    fireEvent.change(input, { target: { value: 'Silva' } })

    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error searching orders:', expect.any(Error))
    })

    consoleErrorSpy.mockRestore()
  })
})
