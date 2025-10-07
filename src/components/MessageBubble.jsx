import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';

export default function MessageBubble({ message }) {
  const isCustomer = message.sender === 'customer';
  
  const getActionTypeLabel = (actionType) => {
    switch (actionType) {
      case 'ai_accepted':
        return '✨ IA Aceita';
      case 'ai_edited':
        return '✏️ IA Editada';
      case 'manual':
        return '📝 Manual';
      default:
        return '';
    }
  };
  
  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm', { locale: ptBR });
    } catch {
      return '';
    }
  };
  
  // Determinar cor da mensagem baseado no tipo de ação
  const getMessageColor = () => {
    if (isCustomer) {
      return 'bg-white border border-gray-200 rounded-tl-none';
    }
    
    // Mensagem do agente - cor baseada no actionType
    if (message.actionType === 'manual') {
      return 'bg-blue-500 text-white rounded-tr-none';
    }
    
    // AI (ai_accepted ou ai_edited)
    return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-tr-none';
  };

  return (
    <div className={`flex ${isCustomer ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-[70%] ${isCustomer ? 'order-1' : 'order-2'}`}>
        {/* Message Bubble */}
        <div className={`rounded-2xl px-4 py-3 shadow-sm ${getMessageColor()}`}>
          <p className={`text-sm ${isCustomer ? 'text-gray-800' : 'text-white'}`}>
            {message.text}
          </p>
        </div>
        
        {/* Metadata */}
        <div className={`flex items-center space-x-2 mt-1 px-2 ${isCustomer ? '' : 'justify-end'}`}>
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>
          
          {!isCustomer && message.actionType && (
            <>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-purple-600 font-medium">
                {getActionTypeLabel(message.actionType)}
              </span>
            </>
          )}
          
          {!isCustomer && (
            <CheckCheck className="w-4 h-4 text-green-500" />
          )}
        </div>
      </div>
    </div>
  );
}
