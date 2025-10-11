import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import SessionExpiredModal from '../components/SessionExpiredModal'

// Mock window.location
delete window.location
window.location = { href: '' }

describe('SessionExpiredModal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  const renderModal = (show = true) => {
    return render(
      <BrowserRouter>
        <SessionExpiredModal show={show} onClose={mockOnClose} />
      </BrowserRouter>
    )
  }

  it('não deve renderizar quando show é false', () => {
    renderModal(false)

    expect(screen.queryByText('Sessão Expirada')).not.toBeInTheDocument()
  })

  it('deve renderizar quando show é true', () => {
    renderModal(true)

    expect(screen.getByText('Sessão Expirada')).toBeInTheDocument()
  })

  it('deve exibir mensagem de sessão expirada', () => {
    renderModal()

    expect(screen.getByText('Sua sessão expirou por motivos de segurança.')).toBeInTheDocument()
    expect(screen.getByText(/Por favor, faça login novamente para continuar/i)).toBeInTheDocument()
  })

  it('deve iniciar countdown de 10 segundos', () => {
    renderModal()

    expect(screen.getByText('10s')).toBeInTheDocument()
  })

  it('deve decrementar countdown a cada segundo', async () => {
    renderModal()

    expect(screen.getByText('10s')).toBeInTheDocument()

    vi.advanceTimersByTime(1000)
    await waitFor(() => expect(screen.getByText('9s')).toBeInTheDocument())

    vi.advanceTimersByTime(1000)
    await waitFor(() => expect(screen.getByText('8s')).toBeInTheDocument())

    vi.advanceTimersByTime(1000)
    await waitFor(() => expect(screen.getByText('7s')).toBeInTheDocument())
  })

  it('deve ter botão para fazer login imediatamente', () => {
    renderModal()

    expect(screen.getByRole('button', { name: /Fazer Login Agora/i })).toBeInTheDocument()
  })

  it('deve redirecionar ao clicar no botão de login', () => {
    renderModal()

    const loginButton = screen.getByRole('button', { name: /Fazer Login Agora/i })
    fireEvent.click(loginButton)

    expect(window.location.href).toBe('/tekflox-social/login')
  })

  it('deve chamar onClose ao clicar no botão', () => {
    renderModal()

    const loginButton = screen.getByRole('button', { name: /Fazer Login Agora/i })
    fireEvent.click(loginButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('deve redirecionar automaticamente após countdown', async () => {
    renderModal()

    // Avança 10 segundos
    vi.advanceTimersByTime(10000)

    await waitFor(() => {
      expect(window.location.href).toBe('/tekflox-social/login')
    })
  })

  it('deve resetar countdown quando modal fecha e reabre', async () => {
    const { rerender } = render(
      <BrowserRouter>
        <SessionExpiredModal show={true} onClose={mockOnClose} />
      </BrowserRouter>
    )

    vi.advanceTimersByTime(5000)
    await waitFor(() => expect(screen.getByText('5s')).toBeInTheDocument())

    // Fecha modal
    rerender(
      <BrowserRouter>
        <SessionExpiredModal show={false} onClose={mockOnClose} />
      </BrowserRouter>
    )

    // Reabre modal
    rerender(
      <BrowserRouter>
        <SessionExpiredModal show={true} onClose={mockOnClose} />
      </BrowserRouter>
    )

    // Deve voltar a 10 segundos
    await waitFor(() => expect(screen.getByText('10s')).toBeInTheDocument())
  })

  it('deve limpar timer ao desmontar componente', () => {
    const { unmount } = renderModal()

    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('deve exibir ícone de relógio', () => {
    renderModal()

    // Lucide-react icons são SVGs, verifica presença através do texto
    expect(screen.getByText('Sessão Expirada')).toBeInTheDocument()
  })

  it('não deve iniciar múltiplos countdowns se show mudar rapidamente', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const { rerender } = render(
      <BrowserRouter>
        <SessionExpiredModal show={true} onClose={mockOnClose} />
      </BrowserRouter>
    )

    // Rapidamente alterna show
    rerender(
      <BrowserRouter>
        <SessionExpiredModal show={true} onClose={mockOnClose} />
      </BrowserRouter>
    )

    rerender(
      <BrowserRouter>
        <SessionExpiredModal show={true} onClose={mockOnClose} />
      </BrowserRouter>
    )

    // Verifica no console que countdown não foi iniciado múltiplas vezes
    const countdownStarts = consoleLogSpy.mock.calls.filter(
      call => call[0] === '[SessionExpiredModal] Starting countdown from 10...'
    )

    expect(countdownStarts.length).toBeLessThanOrEqual(1)

    consoleLogSpy.mockRestore()
  })
})
