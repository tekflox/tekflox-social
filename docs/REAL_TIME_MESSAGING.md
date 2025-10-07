# Real-Time Messaging - Polling vs WebSockets

Este documento explica o sistema de mensagens em tempo real implementado e como migrar de polling para WebSockets quando integrar com WordPress.

## 📊 Arquitetura Atual (Polling)

### Como Funciona

```
Frontend                     Backend
   │                            │
   ├─ sendMessage() ───────────>│ POST /api/messages
   │<─────────── messageId ─────┤ status: 'sending'
   │                            │
   │                            │ (500ms)
   │                            │ status → 'sent'
   │                            │
   │                            │ (1500ms)
   │                            │ status → 'delivered'
   │                            │
   │                            │ (3-5s)
   │                            │ status → 'read'
   │                            │
   ├─ poll (3s) ────────────────>│ GET /api/messages/updates?since=...
   │<─────── updates ────────────┤ { hasUpdates: true, messages: [...] }
   │                            │
   └─ updateMessageStatus() ────┘
      (atualiza UI)
```

### Vantagens
- ✅ **Simples de implementar** - HTTP requests comuns
- ✅ **Compatível com qualquer servidor** - WordPress, Express, etc.
- ✅ **Funciona atrás de proxies/firewalls**
- ✅ **Fácil de debugar** - Network tab mostra tudo

### Desvantagens
- ⚠️ **Latência** - Updates a cada 3 segundos
- ⚠️ **Consumo de banda** - Requests mesmo sem updates
- ⚠️ **Carga no servidor** - Queries contínuas no DB

## 🚀 Migração para WebSockets

### Quando Usar WebSockets

Use WebSockets quando:
- Você precisa de **atualizações instantâneas** (< 1s latency)
- Tem **muitos usuários simultâneos** conversando
- O servidor suporta **conexões persistentes** (Node.js, Socket.io)
- Quer **economizar banda** e reduzir carga no servidor

### Arquitetura WebSocket

```
Frontend                     Backend (WordPress + Node.js)
   │                                  │
   ├─ connect() ─────────────────────>│ WebSocket connection
   │<─────── connected ───────────────┤
   │                                  │
   ├─ emit('sendMessage', {...}) ────>│ Save to DB
   │                                  │ Broadcast to recipient
   │<─────── on('messageStatus') ─────┤ status: 'sent'
   │<─────── on('messageStatus') ─────┤ status: 'delivered'
   │<─────── on('messageStatus') ─────┤ status: 'read'
   │                                  │
   │<─────── on('newMessage') ─────────┤ Push notification
   │                                  │
   └─ disconnect() ───────────────────┘
```

### Implementação com Socket.io

#### 1. Backend (Node.js + WordPress REST API)

```javascript
// socket-server.js
const io = require('socket.io')(3002, {
  cors: { origin: '*' }
});

const axios = require('axios');

// WordPress REST API base
const WP_API = 'https://seu-site.com/wp-json/wp/v2';

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join conversation room
  socket.on('joinConversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });
  
  // Send message
  socket.on('sendMessage', async (data) => {
    try {
      // Save to WordPress via REST API
      const response = await axios.post(`${WP_API}/messages`, {
        conversation_id: data.conversationId,
        text: data.text,
        sender: 'agent',
        status: 'sending'
      });
      
      const message = response.data;
      
      // Emit to sender
      socket.emit('messageSent', message);
      
      // Send to recipient via WhatsApp/Facebook/Instagram API
      await sendToRecipient(message);
      
      // Update status: sent
      message.status = 'sent';
      await updateMessageStatus(message.id, 'sent');
      io.to(`conversation_${data.conversationId}`).emit('messageStatus', {
        messageId: message.id,
        status: 'sent'
      });
      
      // Simulate delivered after 1s
      setTimeout(async () => {
        message.status = 'delivered';
        await updateMessageStatus(message.id, 'delivered');
        io.to(`conversation_${data.conversationId}`).emit('messageStatus', {
          messageId: message.id,
          status: 'delivered'
        });
      }, 1000);
      
    } catch (error) {
      socket.emit('messageError', error.message);
    }
  });
  
  // Mark message as read
  socket.on('markAsRead', async ({ messageId, conversationId }) => {
    await updateMessageStatus(messageId, 'read');
    io.to(`conversation_${conversationId}`).emit('messageStatus', {
      messageId,
      status: 'read'
    });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

async function updateMessageStatus(messageId, status) {
  await axios.patch(`${WP_API}/messages/${messageId}`, { status });
}

console.log('WebSocket server running on port 3002');
```

#### 2. Frontend (React + Socket.io-client)

```javascript
// src/services/socket.js
import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (url = 'http://localhost:3002') => {
  socket = io(url, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10
  });
  
  socket.on('connect', () => {
    console.log('✅ WebSocket connected');
  });
  
  socket.on('disconnect', () => {
    console.log('❌ WebSocket disconnected');
  });
  
  return socket;
};

export const getSocket = () => socket;

export const joinConversation = (conversationId) => {
  if (socket) socket.emit('joinConversation', conversationId);
};

export const sendMessage = (conversationId, text, actionType) => {
  if (socket) {
    socket.emit('sendMessage', { conversationId, text, actionType });
  }
};

export const markAsRead = (messageId, conversationId) => {
  if (socket) {
    socket.emit('markAsRead', { messageId, conversationId });
  }
};

export const onMessageSent = (callback) => {
  if (socket) socket.on('messageSent', callback);
};

export const onMessageStatus = (callback) => {
  if (socket) socket.on('messageStatus', callback);
};

export const onNewMessage = (callback) => {
  if (socket) socket.on('newMessage', callback);
};

export const disconnect = () => {
  if (socket) socket.disconnect();
};
```

#### 3. Atualizar AppContext

```javascript
// src/contexts/AppContext.jsx
import { useEffect } from 'react';
import * as socketService from '../services/socket';

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  useEffect(() => {
    // Initialize WebSocket
    socketService.initSocket();
    
    // Listen for message status updates
    socketService.onMessageStatus(({ messageId, status }) => {
      dispatch({ 
        type: 'UPDATE_MESSAGE_STATUS', 
        payload: { messageId, status } 
      });
    });
    
    // Listen for new messages
    socketService.onNewMessage((message) => {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
    });
    
    return () => {
      socketService.disconnect();
    };
  }, []);
  
  const sendMessage = async (conversationId, text, actionType) => {
    // Send via WebSocket instead of HTTP
    socketService.sendMessage(conversationId, text, actionType);
    
    // Listen for confirmation
    socketService.onMessageSent((message) => {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
    });
  };
  
  const selectConversation = (conversation) => {
    dispatch({ type: 'SET_SELECTED_CONVERSATION', payload: conversation });
    
    // Join WebSocket room for this conversation
    socketService.joinConversation(conversation.id);
    
    // Load messages (still via HTTP)
    loadMessages(conversation.id);
  };
  
  // ... rest of the code
}
```

#### 4. Remover Polling Hook

Quando migrar para WebSockets, **remova o useMessagePolling**:

```javascript
// src/pages/ConversationsNew.jsx

// ❌ REMOVER (polling)
// useMessagePolling(
//   state.selectedConversation?.id,
//   handleMessageUpdates,
//   3000,
//   !!state.selectedConversation
// );

// ✅ WebSocket já escuta eventos automaticamente no AppContext
```

### Integração com WordPress

#### Plugin WordPress para WebSocket

```php
<?php
/**
 * Plugin Name: TekFlox Social WebSocket Bridge
 * Description: Bridge between WordPress and Node.js WebSocket server
 */

add_action('rest_api_init', function() {
  // Webhook when message is read on WhatsApp/Instagram/Facebook
  register_rest_route('tekflox/v1', '/webhook/message-read', array(
    'methods' => 'POST',
    'callback' => 'tekflox_handle_message_read',
    'permission_callback' => 'tekflox_verify_webhook'
  ));
});

function tekflox_handle_message_read($request) {
  $message_id = $request->get_param('message_id');
  $status = $request->get_param('status'); // 'read'
  
  // Update message in WordPress DB
  update_post_meta($message_id, 'status', $status);
  
  // Notify Node.js WebSocket server
  wp_remote_post('http://localhost:3002/api/message-status', array(
    'body' => json_encode(array(
      'messageId' => $message_id,
      'status' => $status
    )),
    'headers' => array('Content-Type' => 'application/json')
  ));
  
  return new WP_REST_Response(array('success' => true), 200);
}
```

## 📊 Comparação: Polling vs WebSockets

| Aspecto | Polling (Atual) | WebSockets |
|---------|----------------|------------|
| **Latência** | 3 segundos | < 100ms |
| **Banda** | ~1 KB/s/usuário | ~100 bytes/update |
| **Carga servidor** | Alta (queries constantes) | Baixa (conexão persistente) |
| **Implementação** | Simples | Média complexidade |
| **Compatibilidade** | 100% | 95% (IE10+) |
| **Escalabilidade** | Limitada | Alta (com Redis) |
| **Debugging** | Fácil | Médio |

## 🎯 Recomendações

### Use Polling quando:
- ✅ Prototipando ou MVP
- ✅ < 50 usuários simultâneos
- ✅ Updates não são críticos (> 3s latency OK)
- ✅ Infraestrutura simples (shared hosting WordPress)

### Migre para WebSockets quando:
- ✅ > 100 usuários simultâneos
- ✅ Precisa latência < 1s
- ✅ Tem servidor Node.js disponível
- ✅ Quer escalar horizontalmente (com Redis/Socket.io-redis)

## 🔄 Próximos Passos

1. **MVP (Atual):** Usar polling por simplicidade
2. **Beta:** Testar com usuários reais e medir latência
3. **Produção:** Decidir entre polling ou WebSockets baseado em métricas
4. **Escala:** Implementar WebSockets + Redis para horizontal scaling

## 📚 Recursos

- [Socket.io Documentation](https://socket.io/docs/)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [Socket.io with Redis Adapter](https://socket.io/docs/v4/redis-adapter/)
- [Scaling WebSockets](https://socket.io/docs/v4/using-multiple-nodes/)

---

**Última atualização:** 6 de Outubro de 2025
