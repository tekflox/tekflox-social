import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AppProvider } from './contexts/AppContext'
import { GlobalPollingProvider } from './components/GlobalPollingProvider'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Conversations from './pages/Conversations'
import Settings from './pages/Settings'
import Login from './pages/Login'
import SessionExpiredModal from './components/SessionExpiredModal'

function App() {
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  // Listen for session expired events from API interceptor
  useEffect(() => {
    const handleSessionExpired = () => {
      // Only show modal if not already showing
      setShowSessionExpired(prev => {
        if (prev) {
          console.log('[App] Session expired modal already showing, ignoring duplicate event');
          return prev;
        }
        return true;
      });
    };

    window.addEventListener('tekflox-session-expired', handleSessionExpired);
    
    return () => {
      window.removeEventListener('tekflox-session-expired', handleSessionExpired);
    };
  }, []);

  return (
    <AuthProvider>
      <AppProvider>
        <GlobalPollingProvider>
          <SessionExpiredModal 
            show={showSessionExpired} 
            onClose={() => setShowSessionExpired(false)} 
          />
          
          <Routes>
          {/* Public route: Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected route: Full-screen conversation interface */}
          <Route 
            path="/conversations" 
            element={
              <ProtectedRoute>
                <Conversations />
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
        </GlobalPollingProvider>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
