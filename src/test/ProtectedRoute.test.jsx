import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import { AuthProvider } from '../contexts/AuthContext'

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  const renderProtectedRoute = (children = <div>Protected Content</div>) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>{children}</ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    )
  }

  it('deve redirecionar para login quando não autenticado', () => {
    renderProtectedRoute()

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('deve renderizar children quando autenticado', () => {
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ name: 'Test User' }))

    renderProtectedRoute()

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('deve renderizar componentes complexos quando autenticado', () => {
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ name: 'Test User' }))

    renderProtectedRoute(
      <div>
        <h1>Dashboard</h1>
        <p>Welcome back!</p>
      </div>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Welcome back!')).toBeInTheDocument()
  })

  it('não deve renderizar children sem token', () => {
    localStorage.setItem('user', JSON.stringify({ name: 'Test User' }))
    // Token não definido

    renderProtectedRoute()

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('não deve renderizar children sem user', () => {
    localStorage.setItem('token', 'fake-token')
    // User não definido

    renderProtectedRoute()

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
