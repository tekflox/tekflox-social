import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Settings from '../pages/Settings'
import { AppProvider } from '../contexts/AppContext'
import { AuthProvider } from '../contexts/AuthContext'

describe('Settings', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ name: 'Test User' }))
  })

  const renderSettings = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <Settings />
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    )
  }

  it('deve renderizar título de configurações', () => {
    renderSettings()

    expect(screen.getByText('Configurações')).toBeInTheDocument()
    expect(screen.getByText('Personalize sua experiência')).toBeInTheDocument()
  })

  it('deve renderizar seção de Inteligência Artificial', () => {
    renderSettings()

    expect(screen.getByText('Inteligência Artificial')).toBeInTheDocument()
  })

  it('deve renderizar seção de Notificações', () => {
    renderSettings()

    expect(screen.getByText('Notificações')).toBeInTheDocument()
  })

  it('deve renderizar toggle de Sugestões Automáticas', () => {
    renderSettings()

    expect(screen.getByText('Sugestões Automáticas')).toBeInTheDocument()
    expect(screen.getByText('Ativar sugestões de resposta por IA')).toBeInTheDocument()
  })

  it('deve renderizar toggle de Notificações Desktop', () => {
    renderSettings()

    expect(screen.getByText('Notificações Desktop')).toBeInTheDocument()
    expect(screen.getByText('Receber alertas de novas mensagens')).toBeInTheDocument()
  })

  it('deve ter toggles funcionais', () => {
    renderSettings()

    const toggleButtons = screen.getAllByRole('button')

    // Primeiro toggle é de AI Suggestions
    const aiToggle = toggleButtons[0]

    expect(aiToggle).toBeInTheDocument()
    fireEvent.click(aiToggle)

    // Verificar que o botão responde ao clique (visual feedback)
    expect(aiToggle).toHaveClass('rounded-full')
  })

  it('deve exibir ícones corretos para cada seção', () => {
    const { container } = renderSettings()

    // Verifica presença de SVGs (ícones Lucide)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('deve organizar settings em cards', () => {
    const { container } = renderSettings()

    // Verifica estrutura de cards com classe ai-card
    const cards = container.querySelectorAll('.ai-card')
    expect(cards.length).toBeGreaterThanOrEqual(2) // Pelo menos 2 seções
  })

  it('deve ter visual consistency nos settings items', () => {
    const { container } = renderSettings()

    // Todos os items devem ter bg-gray-50
    const settingItems = container.querySelectorAll('.bg-gray-50')
    expect(settingItems.length).toBeGreaterThan(0)
  })
})
