import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ConversationsNew from './pages/ConversationsNew'
import Settings from './pages/Settings'

function App() {
  return (
    <Routes>
      {/* Full-screen conversation interface */}
      <Route path="/conversations" element={<ConversationsNew />} />
      
      {/* Other pages with sidebar layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
