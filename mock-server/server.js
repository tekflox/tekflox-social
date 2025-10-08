const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// =====================================================
// MOCK DATA
// =====================================================

const customers = [
  { id: 1, name: 'Maria Silva', email: 'maria@email.com', phone: '+55 11 98765-4321', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: 2, name: 'João Santos', email: 'joao@email.com', phone: '+55 11 98765-4322', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: 3, name: 'Ana Costa', email: 'ana@email.com', phone: '+55 11 98765-4323', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: 4, name: 'Pedro Lima', email: 'pedro@email.com', phone: '+55 11 98765-4324', avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: 5, name: 'Carla Oliveira', email: 'carla@email.com', phone: '+55 11 98765-4325', avatar: 'https://i.pravatar.cc/150?img=5' },
];

const orders = [
  { id: 101, orderId: '#WC-1001', customer: 'Maria Silva', customerId: 1, total: 'R$ 250,00', status: 'completed', date: '2025-10-01' },
  { id: 102, orderId: '#WC-1002', customer: 'João Santos', customerId: 2, total: 'R$ 150,00', status: 'processing', date: '2025-10-03' },
  { id: 103, orderId: '#WC-1003', customer: 'Ana Costa', customerId: 3, total: 'R$ 450,00', status: 'pending', date: '2025-10-04' },
  { id: 104, orderId: '#WC-1004', customer: 'Pedro Lima', customerId: 4, total: 'R$ 320,00', status: 'completed', date: '2025-09-28' },
  { id: 105, orderId: '#WC-1005', customer: 'Carla Oliveira', customerId: 5, total: 'R$ 180,00', status: 'processing', date: '2025-10-05' },
];

const wordpressAccounts = [
  { id: 1, username: 'maria_silva', email: 'maria@email.com', role: 'customer', customerId: 1 },
  { id: 2, username: 'joao_santos', email: 'joao@email.com', role: 'customer', customerId: 2 },
  { id: 3, username: 'ana_costa', email: 'ana@email.com', role: 'customer', customerId: 3 },
  { id: 4, username: 'pedro_lima', email: 'pedro@email.com', role: 'customer', customerId: 4 },
  { id: 5, username: 'carla_oliveira', email: 'carla@email.com', role: 'customer', customerId: 5 },
];

let conversations = [
  {
    id: 1,
    platform: 'instagram',
    contact: { name: 'Maria Silva', username: '@mariasilva', avatar: 'https://i.pravatar.cc/150?img=1' },
    lastMessage: 'Oi! Gostaria de saber se vocês têm esse produto em estoque?',
    timestamp: new Date('2025-10-05T10:30:00'),
    unread: true,
    status: 'pending',
    customerId: 1,
    orderId: null,
    wpAccountId: 1,
    type: 'direct_message',
    summary: 'Cliente perguntando sobre disponibilidade de produto'
  },
  {
    id: 2,
    platform: 'facebook',
    contact: { name: 'João Santos', username: 'joao.santos', avatar: 'https://i.pravatar.cc/150?img=2' },
    lastMessage: 'Qual o prazo de entrega para São Paulo?',
    timestamp: new Date('2025-10-05T09:15:00'),
    unread: true,
    status: 'pending',
    customerId: 2,
    orderId: 102,
    wpAccountId: 2,
    type: 'comment',
    postId: 'post_123',
    summary: 'Cliente pedindo informações sobre prazo de entrega'
  },
  {
    id: 3,
    platform: 'whatsapp',
    contact: { name: 'Ana Costa', username: '+55 11 98765-4323', avatar: 'https://i.pravatar.cc/150?img=3' },
    lastMessage: 'Obrigada pelo excelente atendimento!',
    timestamp: new Date('2025-10-05T08:45:00'),
    unread: false,
    status: 'resolved',
    customerId: 3,
    orderId: 103,
    wpAccountId: 3,
    type: 'direct_message',
    summary: 'Cliente agradecendo atendimento'
  },
  {
    id: 4,
    platform: 'instagram',
    contact: { name: 'Pedro Lima', username: '@pedrolima', avatar: 'https://i.pravatar.cc/150?img=4' },
    lastMessage: 'Esse produto é original?',
    timestamp: new Date('2025-10-04T16:20:00'),
    unread: true,
    status: 'pending',
    customerId: 4,
    orderId: null,
    wpAccountId: 4,
    type: 'comment',
    postId: 'post_456',
    summary: 'Cliente questionando autenticidade do produto'
  },
  {
    id: 5,
    platform: 'facebook',
    contact: { name: 'Carla Oliveira', username: 'carla.oliveira', avatar: 'https://i.pravatar.cc/150?img=5' },
    lastMessage: 'Vocês fazem entrega em Brasília?',
    timestamp: new Date('2025-10-04T14:10:00'),
    unread: false,
    status: 'answered',
    customerId: 5,
    orderId: 105,
    wpAccountId: 5,
    type: 'direct_message',
    summary: 'Cliente perguntando sobre área de entrega'
  },
];

// Message status: sending → sent → delivered → read
let messages = [
  { id: 1, conversationId: 1, sender: 'customer', text: 'Oi! Gostaria de saber se vocês têm esse produto em estoque?', timestamp: new Date('2025-10-05T10:30:00'), type: 'text', status: 'read' },
  { id: 2, conversationId: 2, sender: 'customer', text: 'Qual o prazo de entrega para São Paulo?', timestamp: new Date('2025-10-05T09:15:00'), type: 'text', status: 'read' },
  { id: 3, conversationId: 3, sender: 'customer', text: 'Olá! Fiz um pedido ontem e gostaria de confirmar.', timestamp: new Date('2025-10-05T08:30:00'), type: 'text', status: 'read' },
  { id: 4, conversationId: 3, sender: 'agent', text: 'Olá Ana! Sim, seu pedido #WC-1003 foi confirmado e está em processamento. 😊', timestamp: new Date('2025-10-05T08:35:00'), type: 'text', actionType: 'ai_edited', status: 'read' },
  { id: 5, conversationId: 3, sender: 'customer', text: 'Obrigada pelo excelente atendimento!', timestamp: new Date('2025-10-05T08:45:00'), type: 'text', status: 'read' },
  { id: 6, conversationId: 4, sender: 'customer', text: 'Esse produto é original?', timestamp: new Date('2025-10-04T16:20:00'), type: 'text', status: 'read' },
  { id: 7, conversationId: 5, sender: 'customer', text: 'Vocês fazem entrega em Brasília?', timestamp: new Date('2025-10-04T14:10:00'), type: 'text', status: 'read' },
  { id: 8, conversationId: 5, sender: 'agent', text: 'Sim! Fazemos entregas para todo o Brasil. 🚚', timestamp: new Date('2025-10-04T14:15:00'), type: 'text', actionType: 'ai_accepted', status: 'read' },
];

const posts = [
  {
    id: 'post_123',
    platform: 'facebook',
    content: 'Novidades chegando! Confira nossa nova coleção 🎉',
    image: 'https://picsum.photos/600/400?random=1',
    timestamp: new Date('2025-10-04T12:00:00'),
    likes: 245,
    comments: 18,
    shares: 12
  },
  {
    id: 'post_456',
    platform: 'instagram',
    content: 'Produtos originais com os melhores preços! ✨',
    image: 'https://picsum.photos/600/400?random=2',
    timestamp: new Date('2025-10-03T15:30:00'),
    likes: 389,
    comments: 24,
    shares: 8
  },
];

const aiSuggestions = {
  1: {
    original: 'Oi! Gostaria de saber se vocês têm esse produto em estoque?',
    suggestion: 'Olá Maria! 😊 Sim, temos esse produto disponível em estoque. Posso te ajudar com mais informações?',
    tone: 'friendly',
    confidence: 0.95
  },
  2: {
    original: 'Qual o prazo de entrega para São Paulo?',
    suggestion: 'Olá João! Para São Paulo, o prazo de entrega é de 3 a 5 dias úteis. 🚚',
    tone: 'professional',
    confidence: 0.92
  },
  4: {
    original: 'Esse produto é original?',
    suggestion: 'Olá Pedro! Sim, todos os nossos produtos são 100% originais e contam com garantia. ✅',
    tone: 'professional',
    confidence: 0.98
  },
};

let userActionChoices = [];

// Conversation metadata storage (notes, tags, labels, AI insights chat)
let conversationMetadata = {
  1: { 
    aiInsights: [
      {
        sender: 'ai',
        text: '📊 Resumo da conversa:\n\n👤 Cliente: Maria Silva\n📱 Plataforma: Instagram\n📝 Status: Pendente\n\n💬 Contexto: Cliente perguntando sobre disponibilidade de produto\n\n✅ Cliente vinculado ao WooCommerce\n📦 Pedidos: 1\n\nComo posso te ajudar com esta conversa?',
        timestamp: new Date()
      }
    ],
    manualNotes: '',
    tags: ['vip', 'acompanhamento'],
    labels: [
      { text: 'Novo cliente', color: 'green' },
      { text: 'Importante', color: 'red' }
    ]
  },
  2: { aiInsights: [], manualNotes: '', tags: [], labels: [] },
  3: { 
    aiInsights: [
      {
        sender: 'ai',
        text: '📊 Cliente satisfeito com o atendimento. Pedido #WC-1003 processado com sucesso.\n\nTudo certo com esta conversa! ✅',
        timestamp: new Date()
      }
    ],
    manualNotes: '', 
    tags: ['satisfeito'], 
    labels: [{ text: 'Resolvido', color: 'green' }] 
  },
  4: { aiInsights: [], manualNotes: '', tags: [], labels: [] },
  5: { aiInsights: [], manualNotes: '', tags: [], labels: [] },
};

let settings = {
  connectedAccounts: {
    instagram: { connected: true, username: '@tekflox', lastSync: new Date() },
    facebook: { connected: true, pageName: 'Tekflox', lastSync: new Date() },
    whatsapp: { connected: true, businessNumber: '+55 11 98765-0000', lastSync: new Date() },
  },
  notifications: {
    newMessages: true,
    mentions: true,
    comments: true,
    email: false
  },
  ai: {
    autoSuggestions: true,
    suggestionTone: 'friendly',
    autoSummary: true
  }
};

// =====================================================
// API ENDPOINTS
// =====================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mock server is running!' });
});

// ==================== CONVERSATIONS ====================

app.get('/api/conversations', (req, res) => {
  const { platform, status } = req.query;
  let filtered = [...conversations];
  if (platform) filtered = filtered.filter(c => c.platform === platform);
  if (status) filtered = filtered.filter(c => c.status === status);
  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(filtered);
});

app.get('/api/conversations/:id', (req, res) => {
  const conversation = conversations.find(c => c.id === parseInt(req.params.id));
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  
  // Enrich with linked customer data
  const enriched = { ...conversation };
  if (conversation.customerId) {
    const customer = customers.find(c => c.id === conversation.customerId);
    if (customer) {
      const customerOrders = orders.filter(o => o.customerId === customer.id).map(order => ({
        id: order.id,
        number: order.orderId,
        total: parseFloat(order.total.replace('R$ ', '').replace(',', '.')),
        status: order.status,
        date: order.date,
        items: [
          { id: 1, name: 'Produto Exemplo 1', quantity: 2, price: 50 },
          { id: 2, name: 'Produto Exemplo 2', quantity: 1, price: 150 },
        ]
      }));
      
      enriched.linkedCustomer = {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        recentOrders: customerOrders
      };
    }
  }
  
  res.json(enriched);
});

app.patch('/api/conversations/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = conversations.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Conversation not found' });
  conversations[index] = { ...conversations[index], ...req.body };
  res.json(conversations[index]);
});

app.post('/api/conversations/:id/link', (req, res) => {
  const id = parseInt(req.params.id);
  const { customerId, orderId, wpAccountId } = req.body;
  const index = conversations.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Conversation not found' });
  if (customerId !== undefined) conversations[index].customerId = customerId;
  if (orderId !== undefined) conversations[index].orderId = orderId;
  if (wpAccountId !== undefined) conversations[index].wpAccountId = wpAccountId;
  
  // Return enriched conversation data
  const conversation = conversations[index];
  const enriched = { ...conversation };
  if (conversation.customerId) {
    const customer = customers.find(c => c.id === conversation.customerId);
    if (customer) {
      const customerOrders = orders.filter(o => o.customerId === customer.id).map(order => ({
        id: order.id,
        number: order.orderId,
        total: parseFloat(order.total.replace('R$ ', '').replace(',', '.')),
        status: order.status,
        date: order.date,
        items: [
          { id: 1, name: 'Produto Exemplo 1', quantity: 2, price: 50 },
          { id: 2, name: 'Produto Exemplo 2', quantity: 1, price: 150 },
        ]
      }));
      
      enriched.linkedCustomer = {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        recentOrders: customerOrders
      };
    }
  }
  
  res.json(enriched);
});

// Get conversation metadata (AI insights, notes, tags, labels)
app.get('/api/conversations/:id/metadata', (req, res) => {
  const id = parseInt(req.params.id);
  const metadata = conversationMetadata[id] || { 
    aiInsights: [], 
    manualNotes: '', 
    tags: [], 
    labels: [] 
  };
  
  // If no metadata exists, create it
  if (!conversationMetadata[id]) {
    conversationMetadata[id] = metadata;
  }
  
  res.json({ data: metadata });
});

// Update conversation metadata
app.patch('/api/conversations/:id/metadata', (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  
  if (!conversationMetadata[id]) {
    conversationMetadata[id] = { 
      aiInsights: [], 
      manualNotes: '', 
      tags: [], 
      labels: [] 
    };
  }
  
  // Merge updates
  conversationMetadata[id] = {
    ...conversationMetadata[id],
    ...updates
  };
  
  res.json({ data: conversationMetadata[id] });
});

// ==================== MESSAGES ====================

app.get('/api/conversations/:id/messages', (req, res) => {
  const conversationId = parseInt(req.params.id);
  const conversationMessages = messages.filter(m => m.conversationId === conversationId);
  conversationMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  res.json(conversationMessages);
});

app.post('/api/conversations/:id/messages', (req, res) => {
  const conversationId = parseInt(req.params.id);
  const { text, actionType } = req.body;
  const newMessage = {
    id: messages.length + 1,
    conversationId,
    sender: 'agent',
    text,
    timestamp: new Date(),
    type: 'text',
    actionType: actionType || 'manual',
    status: 'sending' // Initial status
  };
  messages.push(newMessage);
  
  // Update conversation in list
  const convIndex = conversations.findIndex(c => c.id === conversationId);
  if (convIndex !== -1) {
    conversations[convIndex].lastMessage = text;
    conversations[convIndex].timestamp = newMessage.timestamp;
    conversations[convIndex].status = 'answered';
    conversations[convIndex].unread = false;
  }
  
  // Track user action
  userActionChoices.push({
    conversationId,
    messageId: newMessage.id,
    actionType,
    timestamp: new Date()
  });
  
  // Simulate message status progression
  // sending → sent → delivered → read
  setTimeout(() => {
    const msg = messages.find(m => m.id === newMessage.id);
    if (msg) msg.status = 'sent';
  }, 500);
  
  setTimeout(() => {
    const msg = messages.find(m => m.id === newMessage.id);
    if (msg) msg.status = 'delivered';
  }, 1500);
  
  // Customer reads message after 3-5 seconds (simulate)
  setTimeout(() => {
    const msg = messages.find(m => m.id === newMessage.id);
    if (msg) msg.status = 'read';
  }, Math.random() * 2000 + 3000); // 3-5 seconds
  
  res.json(newMessage);
});

// ==================== MESSAGE STATUS ====================

// Update message status (for real-time updates from WordPress)
app.patch('/api/messages/:id/status', (req, res) => {
  const messageId = parseInt(req.params.id);
  const { status } = req.body;
  
  const message = messages.find(m => m.id === messageId);
  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }
  
  // Validate status
  const validStatuses = ['sending', 'sent', 'delivered', 'read'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  message.status = status;
  message.statusUpdatedAt = new Date();
  
  res.json(message);
});

// Get message status updates (for polling)
app.get('/api/conversations/:id/messages/updates', (req, res) => {
  const conversationId = parseInt(req.params.id);
  const { since } = req.query; // Timestamp to get updates since
  
  const convMessages = messages.filter(m => m.conversationId === conversationId);
  
  if (since) {
    const sinceDate = new Date(since);
    const updatedMessages = convMessages.filter(m => {
      return m.statusUpdatedAt && m.statusUpdatedAt > sinceDate;
    });
    return res.json({ messages: updatedMessages, hasUpdates: updatedMessages.length > 0 });
  }
  
  res.json({ messages: convMessages, hasUpdates: false });
});

// ==================== AI SUGGESTIONS ====================

app.get('/api/ai/suggestion/:conversationId', (req, res) => {
  const conversationId = parseInt(req.params.conversationId);
  const suggestion = aiSuggestions[conversationId];
  if (!suggestion) return res.status(404).json({ error: 'No suggestion available' });
  res.json(suggestion);
});

app.get('/api/ai/summary/:conversationId', (req, res) => {
  const conversationId = parseInt(req.params.conversationId);
  const conversation = conversations.find(c => c.id === conversationId);
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  res.json({
    conversationId,
    summary: conversation.summary,
    generatedAt: new Date()
  });
});

app.get('/api/dashboard/pending', (req, res) => {
  const pendingConversations = conversations.filter(c => c.status === 'pending' && c.unread);
  const pendingWithSuggestions = pendingConversations.map(conv => ({
    ...conv,
    aiSuggestion: aiSuggestions[conv.id] || null
  }));
  res.json(pendingWithSuggestions);
});

// ==================== CUSTOMERS ====================

app.get('/api/customers', (req, res) => {
  res.json(customers);
});

app.get('/api/customers/:id', (req, res) => {
  const customer = customers.find(c => c.id === parseInt(req.params.id));
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

app.get('/api/customers/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json(customers);
  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(q.toLowerCase()) ||
    c.email.toLowerCase().includes(q.toLowerCase()) ||
    c.phone.includes(q)
  );
  res.json(filtered);
});

// ==================== ORDERS ====================

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

app.get('/api/customers/:customerId/orders', (req, res) => {
  const customerId = parseInt(req.params.customerId);
  const customerOrders = orders.filter(o => o.customerId === customerId);
  res.json(customerOrders);
});

app.get('/api/orders/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json(orders);
  const filtered = orders.filter(o => 
    o.orderId.toLowerCase().includes(q.toLowerCase()) ||
    o.customer.toLowerCase().includes(q.toLowerCase())
  );
  res.json(filtered);
});

// ==================== WORDPRESS ACCOUNTS ====================

app.get('/api/wordpress-accounts', (req, res) => {
  res.json(wordpressAccounts);
});

app.get('/api/wordpress-accounts/:id', (req, res) => {
  const account = wordpressAccounts.find(a => a.id === parseInt(req.params.id));
  if (!account) return res.status(404).json({ error: 'WordPress account not found' });
  res.json(account);
});

app.get('/api/wordpress-accounts/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json(wordpressAccounts);
  const filtered = wordpressAccounts.filter(a => 
    a.username.toLowerCase().includes(q.toLowerCase()) ||
    a.email.toLowerCase().includes(q.toLowerCase())
  );
  res.json(filtered);
});

// ==================== POSTS ====================

app.get('/api/posts', (req, res) => {
  const { platform } = req.query;
  let filtered = [...posts];
  if (platform) filtered = filtered.filter(p => p.platform === platform);
  res.json(filtered);
});

app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// ==================== ANALYTICS ====================

app.get('/api/analytics/action-choices', (req, res) => {
  const stats = {
    total: userActionChoices.length,
    aiAccepted: userActionChoices.filter(a => a.actionType === 'ai_accepted').length,
    aiEdited: userActionChoices.filter(a => a.actionType === 'ai_edited').length,
    manual: userActionChoices.filter(a => a.actionType === 'manual').length
  };
  res.json({ stats, choices: userActionChoices });
});

app.get('/api/analytics/dashboard', (req, res) => {
  const stats = {
    totalConversations: conversations.length,
    pending: conversations.filter(c => c.status === 'pending').length,
    answered: conversations.filter(c => c.status === 'answered').length,
    resolved: conversations.filter(c => c.status === 'resolved').length,
    byPlatform: {
      instagram: conversations.filter(c => c.platform === 'instagram').length,
      facebook: conversations.filter(c => c.platform === 'facebook').length,
      whatsapp: conversations.filter(c => c.platform === 'whatsapp').length,
    }
  };
  res.json(stats);
});

// ==================== SETTINGS ====================

app.get('/api/settings', (req, res) => {
  res.json(settings);
});

app.patch('/api/settings', (req, res) => {
  settings = { ...settings, ...req.body };
  res.json(settings);
});

// =====================================================
// START SERVER (Development only)
// =====================================================

// For Vercel: export the app directly
// For local development: start the server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Mock Server running on http://localhost:${PORT}`);
    console.log(`📊 API Documentation available at /api/health`);
    console.log(`🔧 Port 3002 configured (avoiding port conflicts)`);
  });
}

// Export for Vercel
module.exports = app;
