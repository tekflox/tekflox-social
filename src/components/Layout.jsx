import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, Settings, ChevronRight, ChevronLeft, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }
  
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/conversations', icon: MessageSquare, label: 'Conversas' },
    { path: '/settings', icon: Settings, label: 'Configurações' }
  ]
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* VS Code Style Navigation Sidebar */}
      <div className={`${sidebarExpanded ? 'w-48' : 'w-16'} bg-gray-900 flex flex-col items-center py-4 transition-all duration-300`}>
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg mb-6 transition-colors"
        >
          {sidebarExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {/* Navigation Items */}
        <div className="flex flex-col space-y-2 w-full px-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-white bg-gray-800' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title={item.label}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarExpanded && <span className="text-sm">{item.label}</span>}
              </button>
            )
          })}
        </div>

        {/* User Info & Logout (bottom) */}
        <div className="mt-auto w-full px-2 space-y-2">
          {/* User info */}
          {sidebarExpanded && user && (
            <div className="px-3 py-2 text-gray-400 text-xs border-t border-gray-800 pt-4">
              <p className="font-semibold text-white truncate">{user.name}</p>
              <p className="truncate">{user.email}</p>
              <p className="text-gray-500 mt-1">{user.role === 'admin' ? 'Administrador' : 'Agente'}</p>
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors text-gray-400 hover:text-red-400 hover:bg-gray-800 w-full"
            title="Sair"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarExpanded && <span className="text-sm">Sair</span>}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
