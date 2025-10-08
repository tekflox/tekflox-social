import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AppProvider } from './contexts/AppContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ConversationsNew from './pages/ConversationsNew'
import Settings from './pages/Settings'
import Login from './pages/Login'

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Routes>
          {/* Public route: Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected route: Full-screen conversation interface */}
          <Route 
            path="/conversations" 
            element={
              <ProtectedRoute>
                <ConversationsNew />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected routes: Other pages with sidebar layout */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch-all: redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
