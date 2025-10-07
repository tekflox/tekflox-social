# TekFlox Social - API Documentation

## Base URL
```
http://localhost:3001/api
```

## Overview
This API provides endpoints for managing social media conversations, customers, orders, WordPress accounts, and AI-powered features. All responses are in JSON format.

---

## 🔍 Health Check

### `GET /health`
Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Mock server is running!"
}
```

---

## 💬 Conversations

### `GET /conversations`
Get all conversations with optional filters.

**Query Parameters:**
- `platform` (optional): Filter by platform (`instagram`, `facebook`, `whatsapp`)
- `status` (optional): Filter by status (`pending`, `answered`, `resolved`)

**Response:**
```json
[
  {
    "id": 1,
    "platform": "instagram",
    "contact": {
      "name": "Maria Silva",
      "username": "@mariasilva",
      "avatar": "https://i.pravatar.cc/150?img=1"
    },
    "lastMessage": "Oi! Gostaria de saber se vocês têm esse produto em estoque?",
    "timestamp": "2025-10-05T10:30:00.000Z",
    "unread": true,
    "status": "pending",
    "customerId": 1,
    "orderId": null,
    "wpAccountId": 1,
    "type": "direct_message",
    "summary": "Cliente perguntando sobre disponibilidade de produto"
  }
]
```

### `GET /conversations/:id`
Get a single conversation by ID.

**Response:**
```json
{
  "id": 1,
  "platform": "instagram",
  "contact": { ... },
  "lastMessage": "...",
  "timestamp": "2025-10-05T10:30:00.000Z",
  "unread": true,
  "status": "pending",
  "customerId": 1,
  "summary": "..."
}
```

### `PATCH /conversations/:id`
Update a conversation.

**Request Body:**
```json
{
  "status": "answered",
  "unread": false
}
```

**Response:**
```json
{
  "id": 1,
  "status": "answered",
  "unread": false,
  ...
}
```

### `POST /conversations/:id/link`
Link a conversation to a customer, order, or WordPress account.

**Request Body:**
```json
{
  "customerId": 1,
  "orderId": 101,
  "wpAccountId": 1
}
```

**Response:**
```json
{
  "id": 1,
  "customerId": 1,
  "orderId": 101,
  "wpAccountId": 1,
  ...
}
```

---

## 📨 Messages

### `GET /conversations/:id/messages`
Get all messages in a conversation.

**Response:**
```json
[
  {
    "id": 1,
    "conversationId": 1,
    "sender": "customer",
    "text": "Oi! Gostaria de saber sobre o produto",
    "timestamp": "2025-10-05T10:30:00.000Z",
    "type": "text"
  },
  {
    "id": 2,
    "conversationId": 1,
    "sender": "agent",
    "text": "Olá! Com certeza, posso ajudar.",
    "timestamp": "2025-10-05T10:35:00.000Z",
    "type": "text",
    "actionType": "ai_accepted"
  }
]
```

### `POST /conversations/:id/messages`
Send a message (reply to customer).

**Request Body:**
```json
{
  "text": "Olá! Posso ajudar com informações.",
  "actionType": "ai_accepted"
}
```

**Action Types:**
- `ai_accepted` - AI suggestion was accepted without changes
- `ai_edited` - AI suggestion was edited before sending
- `manual` - Message was written manually

**Response:**
```json
{
  "id": 9,
  "conversationId": 1,
  "sender": "agent",
  "text": "Olá! Posso ajudar com informações.",
  "timestamp": "2025-10-05T10:40:00.000Z",
  "type": "text",
  "actionType": "ai_accepted"
}
```

---

## 🤖 AI Features

### `GET /ai/suggestion/:conversationId`
Get AI-generated suggestion for a conversation.

**Response:**
```json
{
  "original": "Oi! Gostaria de saber se vocês têm esse produto em estoque?",
  "suggestion": "Olá Maria! 😊 Sim, temos esse produto disponível em estoque. Posso te ajudar com mais informações?",
  "tone": "friendly",
  "confidence": 0.95
}
```

**Tone Options:**
- `friendly` - Amigável, casual
- `professional` - Profissional, formal

### `GET /ai/summary/:conversationId`
Get AI-generated summary of a conversation.

**Response:**
```json
{
  "conversationId": 1,
  "summary": "Cliente perguntando sobre disponibilidade de produto",
  "generatedAt": "2025-10-05T10:30:00.000Z"
}
```

### `GET /dashboard/pending`
Get pending conversations with AI suggestions.

**Response:**
```json
[
  {
    "id": 1,
    "platform": "instagram",
    "contact": { ... },
    "lastMessage": "...",
    "status": "pending",
    "unread": true,
    "aiSuggestion": {
      "original": "...",
      "suggestion": "...",
      "tone": "friendly",
      "confidence": 0.95
    }
  }
]
```

---

## 👥 Customers

### `GET /customers`
Get all customers.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Maria Silva",
    "email": "maria@email.com",
    "phone": "+55 11 98765-4321",
    "avatar": "https://i.pravatar.cc/150?img=1"
  }
]
```

### `GET /customers/:id`
Get a single customer.

### `GET /customers/search?q=maria`
Search customers by name, email, or phone.

---

## 🛒 Orders

### `GET /orders`
Get all orders.

**Response:**
```json
[
  {
    "id": 101,
    "orderId": "#WC-1001",
    "customer": "Maria Silva",
    "customerId": 1,
    "total": "R$ 250,00",
    "status": "completed",
    "date": "2025-10-01"
  }
]
```

### `GET /orders/:id`
Get a single order.

### `GET /customers/:customerId/orders`
Get all orders from a specific customer.

### `GET /orders/search?q=WC-1001`
Search orders by order ID or customer name.

---

## 🔐 WordPress Accounts

### `GET /wordpress-accounts`
Get all WordPress accounts.

**Response:**
```json
[
  {
    "id": 1,
    "username": "maria_silva",
    "email": "maria@email.com",
    "role": "customer",
    "customerId": 1
  }
]
```

### `GET /wordpress-accounts/:id`
Get a single WordPress account.

### `GET /wordpress-accounts/search?q=maria`
Search WordPress accounts by username or email.

---

## 📝 Posts

### `GET /posts`
Get all social media posts.

**Query Parameters:**
- `platform` (optional): Filter by platform

**Response:**
```json
[
  {
    "id": "post_123",
    "platform": "facebook",
    "content": "Novidades chegando! Confira nossa nova coleção 🎉",
    "image": "https://picsum.photos/600/400?random=1",
    "timestamp": "2025-10-04T12:00:00.000Z",
    "likes": 245,
    "comments": 18,
    "shares": 12
  }
]
```

### `GET /posts/:id`
Get a single post.

---

## 📊 Analytics

### `GET /analytics/action-choices`
Get statistics on how users interact with AI suggestions.

**Response:**
```json
{
  "stats": {
    "total": 50,
    "aiAccepted": 35,
    "aiEdited": 10,
    "manual": 5
  },
  "choices": [
    {
      "conversationId": 1,
      "messageId": 10,
      "actionType": "ai_accepted",
      "timestamp": "2025-10-05T10:40:00.000Z"
    }
  ]
}
```

### `GET /analytics/dashboard`
Get dashboard statistics.

**Response:**
```json
{
  "totalConversations": 5,
  "pending": 3,
  "answered": 1,
  "resolved": 1,
  "byPlatform": {
    "instagram": 2,
    "facebook": 2,
    "whatsapp": 1
  }
}
```

---

## ⚙️ Settings

### `GET /settings`
Get current settings.

**Response:**
```json
{
  "connectedAccounts": {
    "instagram": {
      "connected": true,
      "username": "@tekflox",
      "lastSync": "2025-10-05T10:00:00.000Z"
    },
    "facebook": {
      "connected": true,
      "pageName": "Tekflox",
      "lastSync": "2025-10-05T10:00:00.000Z"
    },
    "whatsapp": {
      "connected": true,
      "businessNumber": "+55 11 98765-0000",
      "lastSync": "2025-10-05T10:00:00.000Z"
    }
  },
  "notifications": {
    "newMessages": true,
    "mentions": true,
    "comments": true,
    "email": false
  },
  "ai": {
    "autoSuggestions": true,
    "suggestionTone": "friendly",
    "autoSummary": true
  }
}
```

### `PATCH /settings`
Update settings.

**Request Body:**
```json
{
  "notifications": {
    "newMessages": true,
    "email": true
  },
  "ai": {
    "suggestionTone": "professional"
  }
}
```

**Response:** Returns updated settings object.

---

## 🎯 Usage Examples

### JavaScript (Fetch API)

```javascript
// Get pending conversations with AI suggestions
const response = await fetch('http://localhost:3001/api/dashboard/pending');
const pending = await response.json();

// Send a reply accepting AI suggestion
await fetch('http://localhost:3001/api/conversations/1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Olá! Sim, temos em estoque.',
    actionType: 'ai_accepted'
  })
});

// Link conversation to customer and order
await fetch('http://localhost:3001/api/conversations/1/link', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerId: 1,
    orderId: 101
  })
});
```

### Using the API Service (React)

```javascript
import * as api from './services/api';

// Get conversations
const conversations = await api.getConversations({ platform: 'instagram' });

// Send message
await api.sendMessage(1, {
  text: 'Resposta aqui',
  actionType: 'ai_edited'
});

// Get AI suggestion
const suggestion = await api.getAISuggestion(1);

// Get dashboard stats
const stats = await api.getDashboardStats();
```

---

## 🔒 Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `404` - Resource not found
- `500` - Internal server error

Error responses include:
```json
{
  "error": "Conversation not found"
}
```

---

## 📈 Rate Limiting

Currently, there are no rate limits on the mock server. In production, rate limiting will be implemented.

---

## 🔄 Real-time Updates

The mock server currently doesn't support WebSocket connections. Future versions will include real-time updates via WebSockets for:
- New messages
- Status changes
- AI suggestion generation

---

## 🚀 Next Steps

This mock API will be replaced with a real WordPress/WooCommerce backend plugin that will:
- Integrate with Meta Graph API (Instagram, Facebook)
- Integrate with WhatsApp Business API
- Use real AI models (OpenAI, Claude) for suggestions
- Implement proper authentication (OAuth 2.0)
- Support webhooks for real-time message reception
- Store conversation history in WordPress database

---

**Developed by TekFlox** 💜
