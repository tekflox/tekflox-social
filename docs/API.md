# TekFlox Social - API Reference

**Mock Server Documentation**

Base URL: `http://localhost:3002/api`

---

## Table of Contents

- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Conversations](#conversations)
  - [Messages](#messages)
  - [Metadata](#metadata)
  - [AI Services](#ai-services)
  - [Customers](#customers)
  - [Orders](#orders)
  - [WordPress Accounts](#wordpress-accounts)
  - [Posts](#posts)
  - [Analytics](#analytics)
  - [Settings](#settings)

---

## Authentication

**Current (Mock):** No authentication required

**Future (Production):**
```http
Authorization: Bearer {JWT_TOKEN}
```

---

## Response Format

### Success Response

```json
{
  "data": { ... },
  "success": true,
  "timestamp": "2025-10-06T10:30:00.000Z"
}
```

### Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "success": false,
  "timestamp": "2025-10-06T10:30:00.000Z"
}
```

---

## Error Handling

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Endpoints

### Health Check

#### Check Server Status

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Mock server is running!"
}
```

---

### Conversations

#### List All Conversations

```http
GET /api/conversations
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| platform | string | Filter by platform: `instagram`, `facebook`, `whatsapp` |
| status | string | Filter by status: `pending`, `answered`, `resolved` |

**Example:**
```http
GET /api/conversations?platform=instagram&status=pending
```

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

---

#### Get Single Conversation

```http
GET /api/conversations/:id
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Conversation ID |

**Response:**
```json
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
  "summary": "Cliente perguntando sobre disponibilidade de produto",
  "linkedCustomer": {
    "id": 1,
    "name": "Maria Silva",
    "email": "maria@email.com",
    "phone": "+55 11 98765-4321",
    "recentOrders": [
      {
        "id": 101,
        "number": "#WC-1001",
        "total": 250,
        "status": "completed",
        "date": "2025-10-01",
        "items": [
          {
            "id": 1,
            "name": "Produto Exemplo 1",
            "quantity": 2,
            "price": 50
          }
        ]
      }
    ]
  }
}
```

**Errors:**
- `404`: Conversation not found

---

#### Update Conversation

```http
PATCH /api/conversations/:id
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Conversation ID |

**Request Body:**
```json
{
  "status": "answered",
  "unread": false
}
```

**Response:** Updated conversation object (same as GET)

---

#### Link Customer/Order to Conversation

```http
POST /api/conversations/:id/link
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Conversation ID |

**Request Body:**
```json
{
  "customerId": 1,
  "orderId": 101,
  "wpAccountId": 1
}
```

**Response:** Enriched conversation with linked customer data

---

### Messages

#### Get Conversation Messages

```http
GET /api/conversations/:id/messages
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Conversation ID |

**Response:**
```json
[
  {
    "id": 1,
    "conversationId": 1,
    "sender": "customer",
    "text": "Oi! Gostaria de saber se vocês têm esse produto em estoque?",
    "timestamp": "2025-10-05T10:30:00.000Z",
    "type": "text",
    "actionType": null
  },
  {
    "id": 2,
    "conversationId": 1,
    "sender": "agent",
    "text": "Sim, temos em estoque! Posso te ajudar com o pedido?",
    "timestamp": "2025-10-05T10:35:00.000Z",
    "type": "text",
    "actionType": "ai_accepted"
  }
]
```

---

#### Send Message

```http
POST /api/conversations/:id/messages
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Conversation ID |

**Request Body:**
```json
{
  "text": "Sim, temos em estoque! Posso te ajudar com o pedido?",
  "actionType": "ai_accepted"
}
```

**Body Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | string | Yes | Message text |
| actionType | string | No | `ai_accepted`, `ai_edited`, or `manual` |

**Response:**
```json
{
  "id": 10,
  "conversationId": 1,
  "sender": "agent",
  "text": "Sim, temos em estoque! Posso te ajudar com o pedido?",
  "timestamp": "2025-10-06T11:00:00.000Z",
  "type": "text",
  "actionType": "ai_accepted"
}
```

**Side Effects:**
- Updates conversation `lastMessage`
- Changes conversation status to `answered`
- Marks conversation as read (`unread: false`)
- Records user action choice in analytics

---

### Metadata

#### Get Conversation Metadata

```http
GET /api/conversations/:id/metadata
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Conversation ID |

**Response:**
```json
{
  "data": {
    "aiInsights": [
      {
        "sender": "ai",
        "text": "📊 Resumo da conversa:\n\n👤 Cliente: Maria Silva\n📱 Plataforma: Instagram...",
        "timestamp": "2025-10-06T10:00:00.000Z"
      },
      {
        "sender": "user",
        "text": "Como posso melhorar o atendimento?",
        "timestamp": "2025-10-06T10:05:00.000Z"
      }
    ],
    "manualNotes": "Cliente prefere contato por WhatsApp",
    "tags": ["vip", "acompanhamento"],
    "labels": [
      {
        "text": "Novo cliente",
        "color": "green"
      },
      {
        "text": "Importante",
        "color": "red"
      }
    ]
  }
}
```

---

#### Update Conversation Metadata

```http
PATCH /api/conversations/:id/metadata
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Conversation ID |

**Request Body (all fields optional):**
```json
{
  "aiInsights": [
    {
      "sender": "user",
      "text": "Nova pergunta",
      "timestamp": "2025-10-06T10:30:00.000Z"
    }
  ],
  "manualNotes": "Notas atualizadas",
  "tags": ["vip", "urgente"],
  "labels": [
    {
      "text": "Hot Lead",
      "color": "red"
    }
  ]
}
```

**Response:**
```json
{
  "data": {
    "aiInsights": [...],
    "manualNotes": "Notas atualizadas",
    "tags": ["vip", "urgente"],
    "labels": [
      {
        "text": "Hot Lead",
        "color": "red"
      }
    ]
  }
}
```

**Note:** Updates are merged with existing metadata

---

### AI Services

#### Get AI Suggestion

```http
GET /api/ai/suggestion/:conversationId
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| conversationId | number | Conversation ID |

**Response:**
```json
{
  "conversationId": 1,
  "suggestion": "Olá Maria! Sim, temos esse produto em estoque. Gostaria de saber mais detalhes sobre cores e tamanhos disponíveis?",
  "confidence": 0.92,
  "generatedAt": "2025-10-05T10:31:00.000Z"
}
```

**Errors:**
- `404`: No suggestion available for this conversation

---

#### Get AI Summary

```http
GET /api/ai/summary/:conversationId
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| conversationId | number | Conversation ID |

**Response:**
```json
{
  "conversationId": 1,
  "summary": "Cliente perguntando sobre disponibilidade de produto",
  "generatedAt": "2025-10-06T10:00:00.000Z"
}
```

**Errors:**
- `404`: Conversation not found

---

### Customers

#### List All Customers

```http
GET /api/customers
```

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

---

#### Get Single Customer

```http
GET /api/customers/:id
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Customer ID |

**Response:** Customer object (same as list)

**Errors:**
- `404`: Customer not found

---

#### Search Customers

```http
GET /api/customers/search?q={query}
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query (name, email, or phone) |

**Example:**
```http
GET /api/customers/search?q=maria
```

**Response:** Array of matching customers

---

### Orders

#### List All Orders

```http
GET /api/orders
```

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

---

#### Get Single Order

```http
GET /api/orders/:id
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Order ID |

**Response:** Order object (same as list)

**Errors:**
- `404`: Order not found

---

#### Get Customer Orders

```http
GET /api/customers/:customerId/orders
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| customerId | number | Customer ID |

**Response:** Array of customer's orders

---

#### Search Orders

```http
GET /api/orders/search?q={query}
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query (order ID or customer name) |

**Example:**
```http
GET /api/orders/search?q=WC-1001
```

**Response:** Array of matching orders

---

### WordPress Accounts

#### List All Accounts

```http
GET /api/wordpress-accounts
```

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

---

#### Get Single Account

```http
GET /api/wordpress-accounts/:id
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Account ID |

**Response:** Account object (same as list)

**Errors:**
- `404`: Account not found

---

#### Search Accounts

```http
GET /api/wordpress-accounts/search?q={query}
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query (username or email) |

**Example:**
```http
GET /api/wordpress-accounts/search?q=maria
```

**Response:** Array of matching accounts

---

### Posts

#### List Social Media Posts

```http
GET /api/posts
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| platform | string | Filter by platform: `instagram`, `facebook`, `whatsapp` |

**Example:**
```http
GET /api/posts?platform=instagram
```

**Response:**
```json
[
  {
    "id": "post_123",
    "platform": "instagram",
    "content": "Novo produto disponível! 🎉",
    "mediaUrl": "https://example.com/image.jpg",
    "likes": 150,
    "comments": 23,
    "postedAt": "2025-10-05T08:00:00.000Z"
  }
]
```

---

#### Get Single Post

```http
GET /api/posts/:id
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Post ID |

**Response:** Post object (same as list)

**Errors:**
- `404`: Post not found

---

### Analytics

#### Get Pending Conversations with AI Suggestions

```http
GET /api/dashboard/pending
```

**Response:**
```json
[
  {
    "id": 1,
    "platform": "instagram",
    "contact": {
      "name": "Maria Silva",
      "username": "@mariasilva",
      "avatar": "..."
    },
    "lastMessage": "...",
    "status": "pending",
    "unread": true,
    "aiSuggestion": {
      "suggestion": "Olá Maria! Sim, temos esse produto em estoque...",
      "confidence": 0.92
    }
  }
]
```

---

#### Get Action Choices Statistics

```http
GET /api/analytics/action-choices
```

**Response:**
```json
{
  "stats": {
    "total": 25,
    "aiAccepted": 15,
    "aiEdited": 5,
    "manual": 5
  },
  "choices": [
    {
      "conversationId": 1,
      "messageId": 2,
      "actionType": "ai_accepted",
      "timestamp": "2025-10-05T10:35:00.000Z"
    }
  ]
}
```

---

#### Get Dashboard Statistics

```http
GET /api/analytics/dashboard
```

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

### Settings

#### Get Application Settings

```http
GET /api/settings
```

**Response:**
```json
{
  "autoReplyEnabled": false,
  "aiConfidenceThreshold": 0.85,
  "language": "pt-BR",
  "timezone": "America/Sao_Paulo"
}
```

---

#### Update Settings

```http
PATCH /api/settings
```

**Request Body (all fields optional):**
```json
{
  "autoReplyEnabled": true,
  "aiConfidenceThreshold": 0.90
}
```

**Response:** Updated settings object

**Note:** Updates are merged with existing settings

---

## Data Models

### Conversation

```typescript
interface Conversation {
  id: number;
  platform: 'instagram' | 'facebook' | 'whatsapp';
  contact: {
    name: string;
    username: string;
    avatar: string;
  };
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
  status: 'pending' | 'answered' | 'resolved';
  customerId?: number;
  orderId?: number;
  wpAccountId?: number;
  type: 'direct_message' | 'comment';
  postId?: string;
  summary: string;
  linkedCustomer?: Customer & { recentOrders: Order[] };
}
```

### Message

```typescript
interface Message {
  id: number;
  conversationId: number;
  sender: 'customer' | 'agent';
  text: string;
  timestamp: Date;
  type: 'text' | 'image' | 'audio' | 'video' | 'file';
  actionType?: 'ai_accepted' | 'ai_edited' | 'manual';
  mediaUrl?: string;
}
```

### Metadata

```typescript
interface ConversationMetadata {
  aiInsights: Array<{
    sender: 'ai' | 'user';
    text: string;
    timestamp: Date;
  }>;
  manualNotes: string;
  tags: string[];
  labels: Array<{
    text: string;
    color: 'green' | 'red' | 'yellow' | 'blue' | 'purple';
  }>;
}
```

### Customer

```typescript
interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}
```

### Order

```typescript
interface Order {
  id: number;
  orderId: string;
  customer: string;
  customerId: number;
  total: string;
  status: 'completed' | 'processing' | 'pending';
  date: string;
}
```

### AI Suggestion

```typescript
interface AISuggestion {
  conversationId: number;
  suggestion: string;
  confidence: number; // 0.0 to 1.0
  generatedAt: Date;
}
```

---

## Rate Limiting

**Current (Mock):** No rate limiting

**Future (Production):**
- 100 requests per minute per IP
- 1000 requests per hour per user
- Burst: 20 requests per second

---

## Webhooks

**Future Feature:**

Subscribe to real-time events:

```http
POST /api/webhooks/subscribe
```

Events:
- `conversation.new`
- `conversation.updated`
- `message.received`
- `message.sent`

---

## Pagination

**Future Feature:**

For endpoints returning large datasets:

```http
GET /api/conversations?page=1&limit=20
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Testing

### cURL Examples

**List Conversations:**
```bash
curl http://localhost:3002/api/conversations
```

**Get Single Conversation:**
```bash
curl http://localhost:3002/api/conversations/1
```

**Send Message:**
```bash
curl -X POST http://localhost:3002/api/conversations/1/messages \
  -H "Content-Type: application/json" \
  -d '{"text":"Teste de mensagem","actionType":"manual"}'
```

**Update Metadata:**
```bash
curl -X PATCH http://localhost:3002/api/conversations/1/metadata \
  -H "Content-Type: application/json" \
  -d '{"tags":["vip","urgente"]}'
```

### JavaScript/Axios Examples

**List Conversations:**
```javascript
const response = await axios.get('http://localhost:3002/api/conversations', {
  params: { platform: 'instagram', status: 'pending' }
});
```

**Send Message:**
```javascript
const response = await axios.post(
  'http://localhost:3002/api/conversations/1/messages',
  {
    text: 'Olá! Como posso ajudar?',
    actionType: 'manual'
  }
);
```

**Update Metadata:**
```javascript
const response = await axios.patch(
  'http://localhost:3002/api/conversations/1/metadata',
  {
    manualNotes: 'Cliente VIP - prioridade alta',
    tags: ['vip', 'urgente']
  }
);
```

---

## Changelog

### Version 1.0.0 (Current)
- Initial mock server implementation
- 20+ API endpoints
- In-memory data storage
- CORS enabled for development
- Nodemon auto-reload

### Future Versions
- 1.1.0: Add authentication (JWT)
- 1.2.0: Add rate limiting
- 1.3.0: Add pagination
- 2.0.0: Real database integration
- 3.0.0: Real social media APIs

---

**Last Updated:** October 2025  
**Version:** 1.0.0  
**Status:** Mock Server (Development)
