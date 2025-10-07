import { useState } from 'react'
import { Sparkles, Send, Edit3, Type, Clock, User } from 'lucide-react'
import { motion } from 'framer-motion'

function ConversationCard({ conversation, onReply }) {
  const [replyMode, setReplyMode] = useState('suggestion')
  const [replyText, setReplyText] = useState(conversation.aiSuggestion)
  const [isEditing, setIsEditing] = useState(false)
  
  const handleSendReply = () => {
    onReply({
      conversationId: conversation.id,
      text: replyText,
      mode: replyMode,
      timestamp: new Date().toISOString()
    })
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ai-card p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-ai-purple to-ai-pink flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{conversation.contact?.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{conversation.platform}</span>
              <span>•</span>
              <Clock className="w-3 h-3" />
              <span>{conversation.timeAgo}</span>
            </div>
          </div>
        </div>
        {conversation.order && (
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Pedido #{conversation.order.id}
          </div>
        )}
      </div>
      
      {/* Message */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-gray-700">{conversation.lastMessage}</p>
      </div>
      
      {/* AI Summary */}
      {conversation.aiSummary && (
        <div className="bg-gradient-to-r from-ai-purple/10 to-ai-pink/10 rounded-xl p-4 border border-ai-purple/20">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-ai-purple" />
            <span className="text-sm font-semibold text-ai-purple">Resumo AI</span>
          </div>
          <p className="text-sm text-gray-700">{conversation.aiSummary}</p>
        </div>
      )}
      
      {/* Reply Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Responder</span>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setReplyMode('suggestion')
                setReplyText(conversation.aiSuggestion)
                setIsEditing(false)
              }}
              className={`ai-button text-xs ${
                replyMode === 'suggestion' 
                  ? 'ai-gradient text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Sparkles className="w-3 h-3 inline mr-1" />
              Sugestão AI
            </button>
            <button
              onClick={() => {
                setReplyMode('edit')
                setIsEditing(true)
              }}
              className={`ai-button text-xs ${
                replyMode === 'edit' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Edit3 className="w-3 h-3 inline mr-1" />
              Editar
            </button>
            <button
              onClick={() => {
                setReplyMode('manual')
                setReplyText('')
                setIsEditing(true)
              }}
              className={`ai-button text-xs ${
                replyMode === 'manual' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Type className="w-3 h-3 inline mr-1" />
              Manual
            </button>
          </div>
        </div>
        
        <div className="relative">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            readOnly={!isEditing && replyMode === 'suggestion'}
            className={`w-full p-4 rounded-xl border-2 transition-all resize-none ${
              isEditing 
                ? 'border-ai-purple/50 bg-white' 
                : 'border-gray-200 bg-gray-50'
            }`}
            rows="3"
            placeholder="Digite sua resposta..."
          />
          {replyMode === 'suggestion' && !isEditing && (
            <div className="absolute top-2 right-2">
              <span className="px-2 py-1 bg-ai-purple text-white text-xs rounded-full">
                AI Sugerido
              </span>
            </div>
          )}
        </div>
        
        <button
          onClick={handleSendReply}
          className="w-full ai-gradient text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center space-x-2"
        >
          <Send className="w-5 h-5" />
          <span>Enviar Resposta</span>
        </button>
      </div>
    </motion.div>
  )
}

export default ConversationCard
