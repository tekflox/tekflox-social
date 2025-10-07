import { useState } from 'react'
import { useQuery } from 'react-query'
import ConversationCard from '../components/ConversationCard'
import api from '../services/api'
import { Filter, Search } from 'lucide-react'
import { useApp } from '../contexts/AppContext'

function Conversations() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const { state } = useApp()
  
  const { data: conversations, refetch } = useQuery(
    ['conversations', state.selectedPlatforms],
    () => api.getConversations(state.selectedPlatforms)
  )
  
  const handleReply = async (replyData) => {
    await api.sendReply(replyData)
    refetch()
  }
  
  const filteredConversations = conversations?.filter(conv => {
    const matchesFilter = filter === 'all' || conv.status === filter
    const matchesSearch = conv.contact?.name?.toLowerCase().includes(search.toLowerCase()) ||
                          conv.lastMessage?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  }) || []
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-ai-purple to-ai-pink bg-clip-text text-transparent">
          Conversas
        </h1>
        <p className="text-gray-600 mt-2">Gerencie suas interações com clientes</p>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-ai-purple focus:outline-none"
          />
        </div>
        
        <div className="flex gap-2">
          {['all', 'pending', 'replied', 'archived'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === status
                  ? 'ai-gradient text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Todas' : 
               status === 'pending' ? 'Pendentes' :
               status === 'replied' ? 'Respondidas' : 'Arquivadas'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Conversations List */}
      <div className="grid gap-6">
        {filteredConversations.map(conversation => (
          <ConversationCard
            key={conversation.id}
            conversation={conversation}
            onReply={handleReply}
          />
        ))}
      </div>
    </div>
  )
}

export default Conversations
