import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, CheckCheck, Clock } from 'lucide-react';

export default function MessageBubble({ message }) {
  const isCustomer = message.sender === 'customer';
  
  // Extract image URL from Facebook attachments format
  // Format: [{"type":"image","payload":{"url":"https://..."}}]
  const getImageUrl = () => {
    // Check direct image field (for mock server compatibility)
    if (message.image) {
      return message.image;
    }
    
    // Check attachments array from Facebook/WordPress API
    if (message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0) {
      const imageAttachment = message.attachments.find(att => att.type === 'image');
      if (imageAttachment && imageAttachment.payload && imageAttachment.payload.url) {
        return imageAttachment.payload.url;
      }
    }
    
    return null;
  };
  
  const imageUrl = getImageUrl();
  
  // Render status icon based on message status
  const renderStatusIcon = () => {
    if (isCustomer) return null; // Customer messages don't show status
    
    // Priorize status field if exists (for optimistic updates)
    if (message.status) {
      switch (message.status) {
        case 'sending':
          return <Clock className="w-4 h-4 text-gray-400 animate-pulse" />;
        case 'sent':
          return <Check className="w-4 h-4 text-gray-400" />;
        case 'delivered':
          return <CheckCheck className="w-4 h-4 text-gray-400" />;
        case 'read':
          return <CheckCheck className="w-4 h-4 text-blue-500" />;
        case 'failed':
          return <span className="text-red-500 text-xs">⚠️</span>;
        default:
          return <Clock className="w-4 h-4 text-gray-400" />;
      }
    }
    
    // Fallback to deliveryStatus from API
    switch (message.deliveryStatus) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCheck className="w-4 h-4 text-blue-500" />; // Default: read (tick duplo azul)
    }
  };
  
  const getStatusLabel = () => {
    const status = message.status || message.deliveryStatus;
    
    switch (status) {
      case 'sending':
        return 'Enviando...';
      case 'sent':
        return 'Enviada';
      case 'delivered':
        return 'Entregue';
      case 'read':
        return 'Lida';
      case 'failed':
        return 'Falha ao enviar';
      default:
        return 'Lida';
    }
  };
  
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
      const date = new Date(timestamp);
      const timeStr = format(date, 'HH:mm', { locale: ptBR });
      
      if (isToday(date)) {
        return `Hoje ${timeStr}`;
      } else if (isYesterday(date)) {
        return `Ontem ${timeStr}`;
      } else {
        const dateStr = format(date, 'dd/MM/yyyy', { locale: ptBR });
        return `${dateStr} ${timeStr}`;
      }
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
          {/* Image Attachment */}
          {imageUrl && (
            <div className="mb-2">
              <img 
                src={imageUrl} 
                alt="Anexo" 
                className="rounded-lg max-w-full h-auto max-h-80 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  console.error('Failed to load image:', imageUrl);
                }}
              />
            </div>
          )}
          
          {/* Text Content */}
          {message.text && (
            <p className={`text-sm ${isCustomer ? 'text-gray-800' : 'text-white'}`}>
              {message.text}
            </p>
          )}
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
            <>
              <span className="text-xs text-gray-400">•</span>
              <div className="flex items-center space-x-1" title={getStatusLabel()}>
                {renderStatusIcon()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
