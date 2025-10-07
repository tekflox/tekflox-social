import { useState } from 'react';
import { Sparkles, Send, Edit3, Type, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AISuggestionCard({ conversation, onSendReply }) {
  const [replyMode, setReplyMode] = useState(null); // null, 'accepted', 'editing', 'manual'
  const [replyText, setReplyText] = useState(conversation.aiSuggestion?.suggestion || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAccept = async () => {
    setReplyMode('accepted');
    setIsSubmitting(true);
    try {
      await onSendReply(conversation.id, replyText, 'ai_accepted');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = () => {
    setReplyMode('editing');
  };
  
  const handleManual = () => {
    setReplyMode('manual');
    setReplyText('');
  };
  
  const handleSendEdited = async () => {
    setIsSubmitting(true);
    try {
      const actionType = replyMode === 'manual' ? 'manual' : 'ai_edited';
      await onSendReply(conversation.id, replyText, actionType);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!conversation.aiSuggestion) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-ai border border-purple-100 overflow-hidden"
    >
      {/* Gradient Header */}
      <div className="bg-gradient-ai p-4">
        <div className="flex items-center space-x-2 text-white">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <h3 className="font-semibold">Sugestão de Resposta com IA</h3>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        {/* Customer Message */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">MENSAGEM DO CLIENTE:</p>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-gray-700">{conversation.aiSuggestion.original}</p>
          </div>
        </div>
        
        {/* AI Suggestion or Editable Text */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-purple-600">
              {replyMode === 'manual' ? 'SUA RESPOSTA:' : 'SUGESTÃO DA IA:'}
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                Tom: {conversation.aiSuggestion.tone === 'friendly' ? 'Amigável' : 'Profissional'}
              </span>
              <span className="text-xs font-medium text-green-600">
                {Math.round(conversation.aiSuggestion.confidence * 100)}% confiança
              </span>
            </div>
          </div>
          
          {replyMode === 'editing' || replyMode === 'manual' ? (
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full p-4 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none"
              rows="4"
              placeholder="Digite sua resposta..."
            />
          ) : (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
              <p className="text-gray-800">{replyText}</p>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        {!replyMode ? (
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleAccept}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center p-4 bg-gradient-ai text-white rounded-xl hover:shadow-glow transition-all duration-200 disabled:opacity-50"
            >
              <Check className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Aceitar</span>
            </button>
            
            <button
              onClick={handleEdit}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <Edit3 className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Editar</span>
            </button>
            
            <button
              onClick={handleManual}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-r from-orange-400 to-yellow-400 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <Type className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Manual</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setReplyMode(null)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleSendEdited}
              disabled={isSubmitting || !replyText.trim()}
              className="flex-1 px-6 py-3 bg-gradient-ai text-white rounded-xl font-medium hover:shadow-glow transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>Enviar</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
