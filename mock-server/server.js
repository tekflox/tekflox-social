const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// =====================================================
// MOCK DATA
// =====================================================

// Mock users for authentication
const users = [
  { 
    id: 1, 
    username: 'admin', 
    password: 'admin123', // Em produção: usar bcrypt
    email: 'admin@tekflox.com',
    name: 'Administrador',
    role: 'admin'
  },
  { 
    id: 2, 
    username: 'agente', 
    password: 'agente123',
    email: 'agente@tekflox.com',
    name: 'Agente de Suporte',
    role: 'agent'
  },
  { 
    id: 3, 
    username: 'demo', 
    password: 'demo',
    email: 'demo@tekflox.com',
    name: 'Usuário Demo',
    role: 'agent'
  }
];

// Simple JWT token generator (mock - em produção usar jsonwebtoken)
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
  };
  // Mock token: base64 encode do payload
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

// Validate token middleware
const validateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check expiration
    if (payload.exp < Date.now()) {
      return res.status(401).json({ error: 'Token expirado' });
    }
    
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

const customers = [
  { id: 1, name: 'Maria Silva', email: 'maria@email.com', phone: '+55 11 98765-4321', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: 2, name: 'João Santos', email: 'joao@email.com', phone: '+55 11 98765-4322', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: 3, name: 'Ana Costa', email: 'ana@email.com', phone: '+55 11 98765-4323', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: 4, name: 'Pedro Lima', email: 'pedro@email.com', phone: '+55 11 98765-4324', avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: 5, name: 'Carla Oliveira', email: 'carla@email.com', phone: '+55 11 98765-4325', avatar: 'https://i.pravatar.cc/150?img=5' },
];

// WooCommerce Orders - Últimos 45 dias
const orders = [
  { id: 101, orderNumber: 'WC-1001', customerName: 'Maria Silva', customerEmail: 'maria@email.com', customerId: 1, total: 250.00, status: 'completed', date: '2025-10-06T10:30:00', items: [{ id: 1, name: 'Tênis Nike Air Max', quantity: 1, price: 250.00 }] },
  { id: 102, orderNumber: 'WC-1002', customerName: 'João Santos', customerEmail: 'joao@email.com', customerId: 2, total: 150.00, status: 'processing', date: '2025-10-05T14:20:00', items: [{ id: 2, name: 'Camisa Polo', quantity: 2, price: 75.00 }] },
  { id: 103, orderNumber: 'WC-1003', customerName: 'Ana Costa', customerEmail: 'ana@email.com', customerId: 3, total: 450.00, status: 'completed', date: '2025-10-04T09:15:00', items: [{ id: 3, name: 'Notebook Dell', quantity: 1, price: 450.00 }] },
  { id: 104, orderNumber: 'WC-1004', customerName: 'Pedro Lima', customerEmail: 'pedro@email.com', customerId: 4, total: 320.00, status: 'completed', date: '2025-10-03T16:45:00', items: [{ id: 4, name: 'Smartphone Samsung', quantity: 1, price: 320.00 }] },
  { id: 105, orderNumber: 'WC-1005', customerName: 'Carla Oliveira', customerEmail: 'carla@email.com', customerId: 5, total: 180.00, status: 'processing', date: '2025-10-02T11:30:00', items: [{ id: 5, name: 'Fone Bluetooth', quantity: 3, price: 60.00 }] },
  { id: 106, orderNumber: 'WC-1006', customerName: 'Lucas Ferreira', customerEmail: 'lucas@email.com', customerId: 6, total: 890.00, status: 'completed', date: '2025-10-01T08:00:00', items: [{ id: 6, name: 'Smartwatch Apple', quantity: 1, price: 890.00 }] },
  { id: 107, orderNumber: 'WC-1007', customerName: 'Juliana Alves', customerEmail: 'juliana@email.com', customerId: 7, total: 125.00, status: 'pending', date: '2025-09-30T15:20:00', items: [{ id: 7, name: 'Mochila Executiva', quantity: 1, price: 125.00 }] },
  { id: 108, orderNumber: 'WC-1008', customerName: 'Roberto Souza', customerEmail: 'roberto@email.com', customerId: 8, total: 540.00, status: 'completed', date: '2025-09-29T13:40:00', items: [{ id: 8, name: 'Cadeira Gamer', quantity: 1, price: 540.00 }] },
  { id: 109, orderNumber: 'WC-1009', customerName: 'Fernanda Dias', customerEmail: 'fernanda@email.com', customerId: 9, total: 95.00, status: 'processing', date: '2025-09-28T10:10:00', items: [{ id: 9, name: 'Mouse Gamer RGB', quantity: 1, price: 95.00 }] },
  { id: 110, orderNumber: 'WC-1010', customerName: 'Carlos Eduardo', customerEmail: 'carlos.edu@email.com', customerId: 10, total: 275.00, status: 'completed', date: '2025-09-27T17:30:00', items: [{ id: 10, name: 'Teclado Mecânico', quantity: 1, price: 275.00 }] },
  { id: 111, orderNumber: 'WC-1011', customerName: 'Patrícia Mendes', customerEmail: 'patricia@email.com', customerId: 11, total: 430.00, status: 'completed', date: '2025-09-26T09:00:00', items: [{ id: 11, name: 'Monitor LG 24"', quantity: 1, price: 430.00 }] },
  { id: 112, orderNumber: 'WC-1012', customerName: 'Ricardo Gomes', customerEmail: 'ricardo@email.com', customerId: 12, total: 160.00, status: 'processing', date: '2025-09-25T14:50:00', items: [{ id: 12, name: 'Webcam Full HD', quantity: 2, price: 80.00 }] },
  { id: 113, orderNumber: 'WC-1013', customerName: 'Beatriz Rocha', customerEmail: 'beatriz@email.com', customerId: 13, total: 720.00, status: 'completed', date: '2025-09-24T11:20:00', items: [{ id: 13, name: 'Tablet Samsung', quantity: 1, price: 720.00 }] },
  { id: 114, orderNumber: 'WC-1014', customerName: 'Thiago Martins', customerEmail: 'thiago@email.com', customerId: 14, total: 340.00, status: 'pending', date: '2025-09-23T16:00:00', items: [{ id: 14, name: 'Caixa de Som JBL', quantity: 2, price: 170.00 }] },
  { id: 115, orderNumber: 'WC-1015', customerName: 'Amanda Silva', customerEmail: 'amanda@email.com', customerId: 15, total: 680.00, status: 'completed', date: '2025-09-22T12:30:00', items: [{ id: 15, name: 'Console PlayStation 5', quantity: 1, price: 680.00 }] },
  { id: 116, orderNumber: 'WC-1016', customerName: 'Maria Silva', customerEmail: 'maria@email.com', customerId: 1, total: 85.00, status: 'processing', date: '2025-09-20T10:00:00', items: [{ id: 16, name: 'Capinha iPhone', quantity: 1, price: 85.00 }] },
  { id: 117, orderNumber: 'WC-1017', customerName: 'João Santos', customerEmail: 'joao@email.com', customerId: 2, total: 520.00, status: 'completed', date: '2025-09-18T15:45:00', items: [{ id: 17, name: 'Smart TV 43"', quantity: 1, price: 520.00 }] },
  { id: 118, orderNumber: 'WC-1018', customerName: 'Ana Costa', customerEmail: 'ana@email.com', customerId: 3, total: 210.00, status: 'completed', date: '2025-09-15T09:30:00', items: [{ id: 18, name: 'Air Fryer', quantity: 1, price: 210.00 }] },
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
  
  // Messages with images
  { id: 9, conversationId: 1, sender: 'customer', text: 'Olha essa foto do produto que eu quero!', image: 'https://picsum.photos/400/300?random=10', timestamp: new Date('2025-10-05T10:32:00'), type: 'image', status: 'read' },
  { id: 10, conversationId: 1, sender: 'agent', text: 'Sim, temos esse modelo! 😊', image: 'https://picsum.photos/400/300?random=11', timestamp: new Date('2025-10-05T10:35:00'), type: 'image', actionType: 'manual', status: 'read' },
  { id: 11, conversationId: 2, sender: 'customer', image: 'https://picsum.photos/400/300?random=12', timestamp: new Date('2025-10-05T09:17:00'), type: 'image', status: 'read' }, // Image only, no text
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
  3: {
    original: 'Vocês aceitam cartão de crédito?',
    suggestion: 'Olá Ana! Sim, aceitamos todas as bandeiras de cartão de crédito e também PIX. 💳',
    tone: 'friendly',
    confidence: 0.93
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

// ==================== AUTHENTICATION ====================

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log(`[Auth] Login attempt - Username: ${username}`);
  
  // Validate input
  if (!username || !password) {
    return res.status(400).json({ 
      error: 'Usuário e senha são obrigatórios' 
    });
  }
  
  // Find user
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    console.log(`[Auth] Login failed - Invalid credentials`);
    return res.status(401).json({ 
      error: 'Usuário ou senha inválidos' 
    });
  }
  
  // Generate token
  const token = generateToken(user);
  
  console.log(`[Auth] Login successful - User: ${user.username}, Role: ${user.role}`);
  
  // Return user data and token
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

// Verify token endpoint
app.get('/api/auth/me', validateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.userId,
      username: req.user.username,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    }
  });
});

// Logout endpoint (client-side apenas remove token)
app.post('/api/auth/logout', validateToken, (req, res) => {
  console.log(`[Auth] Logout - User: ${req.user.username}`);
  res.json({ message: 'Logout realizado com sucesso' });
});

// ==================== CONVERSATIONS ====================

app.get('/api/conversations', validateToken, (req, res) => {
  const { platform, status, last_message_id } = req.query;
  
  // Filter conversations
  let filtered = [...conversations];
  if (platform) filtered = filtered.filter(c => c.platform === platform);
  if (status) filtered = filtered.filter(c => c.status === status);
  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Include messages for each conversation
  const lastMessageId = last_message_id ? parseInt(last_message_id) : 0;
  
  const conversationsWithMessages = filtered.map(conv => {
    // Get all messages for this conversation
    let conversationMessages = messages.filter(m => m.conversationId === conv.id);
    
    // If last_message_id provided, only return NEW messages
    if (lastMessageId > 0) {
      conversationMessages = conversationMessages.filter(m => m.id > lastMessageId);
    }
    
    // Sort by timestamp
    conversationMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return {
      ...conv,
      messages: conversationMessages
    };
  });
  
  // Get highest message ID for next polling
  const allMessageIds = messages.map(m => m.id);
  const maxMessageId = allMessageIds.length > 0 ? Math.max(...allMessageIds) : 0;
  
  res.json({
    conversations: conversationsWithMessages,
    last_message_id: maxMessageId
  });
});

app.get('/api/conversations/:id', validateToken, (req, res) => {
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

app.patch('/api/conversations/:id', validateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const index = conversations.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Conversation not found' });
  conversations[index] = { ...conversations[index], ...req.body };
  res.json(conversations[index]);
});

app.post('/api/conversations/:id/link', validateToken, (req, res) => {
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
app.get('/api/conversations/:id/metadata', validateToken, (req, res) => {
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
app.patch('/api/conversations/:id/metadata', validateToken, (req, res) => {
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

app.get('/api/conversations/:id/messages', validateToken, (req, res) => {
  const conversationId = parseInt(req.params.id);
  const conversationMessages = messages.filter(m => m.conversationId === conversationId);
  conversationMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  res.json(conversationMessages);
});

app.post('/api/conversations/:id/messages', validateToken, (req, res) => {
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
app.patch('/api/messages/:id/status', validateToken, (req, res) => {
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

// Get message status updates (LONG POLLING)
// Mantém conexão aberta até haver updates ou timeout (default: 15s)
app.get('/api/conversations/:id/messages/updates', validateToken, (req, res) => {
  const conversationId = parseInt(req.params.id);
  const { since, timeout = 15000 } = req.query; // Timeout padrão: 15 segundos
  
  const maxTimeout = parseInt(timeout);
  const startTime = Date.now();
  
  const checkForUpdates = () => {
    const convMessages = messages.filter(m => m.conversationId === conversationId);
    
    if (since) {
      const sinceDate = new Date(since);
      const updatedMessages = convMessages.filter(m => {
        return m.statusUpdatedAt && m.statusUpdatedAt > sinceDate;
      });
      
      // Se encontrou updates, retorna imediatamente
      if (updatedMessages.length > 0) {
        console.log(`[Long Polling] Found ${updatedMessages.length} updates for conversation ${conversationId}`);
        return res.json({ messages: updatedMessages, hasUpdates: true });
      }
    }
    
    // Verifica se excedeu o timeout
    const elapsed = Date.now() - startTime;
    if (elapsed >= maxTimeout) {
      console.log(`[Long Polling] Timeout (${elapsed}ms) for conversation ${conversationId}`);
      return res.json({ messages: [], hasUpdates: false, timeout: true });
    }
    
    // Verifica novamente em 1 segundo
    setTimeout(checkForUpdates, 1000);
  };
  
  // Inicia a verificação
  console.log(`[Long Polling] Started for conversation ${conversationId}, timeout: ${maxTimeout}ms`);
  checkForUpdates();
  
  // Cleanup se o cliente desconectar
  req.on('close', () => {
    console.log(`[Long Polling] Client disconnected for conversation ${conversationId}`);
  });
});

// ==================== AI SUGGESTIONS ====================

app.get('/api/ai/suggestion/:conversationId', validateToken, (req, res) => {
  const conversationId = parseInt(req.params.conversationId);
  const suggestion = aiSuggestions[conversationId];
  if (!suggestion) return res.status(404).json({ error: 'No suggestion available' });
  res.json(suggestion);
});

app.get('/api/ai/summary/:conversationId', validateToken, (req, res) => {
  const conversationId = parseInt(req.params.conversationId);
  const conversation = conversations.find(c => c.id === conversationId);
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  res.json({
    conversationId,
    summary: conversation.summary,
    generatedAt: new Date()
  });
});

app.get('/api/dashboard/pending', validateToken, (req, res) => {
  const pendingConversations = conversations.filter(c => c.status === 'pending' && c.unread);
  const pendingWithSuggestions = pendingConversations.map(conv => ({
    ...conv,
    aiSuggestion: aiSuggestions[conv.id] || null
  }));
  res.json(pendingWithSuggestions);
});

// ==================== CUSTOMERS ====================

app.get('/api/customers', validateToken, (req, res) => {
  res.json(customers);
});

app.get('/api/customers/:id', validateToken, (req, res) => {
  const customer = customers.find(c => c.id === parseInt(req.params.id));
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

app.get('/api/customers/search', validateToken, (req, res) => {
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

app.get('/api/orders', validateToken, (req, res) => {
  res.json(orders);
});

app.get('/api/orders/:id', validateToken, (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

app.get('/api/customers/:customerId/orders', validateToken, (req, res) => {
  const customerId = parseInt(req.params.customerId);
  const customerOrders = orders.filter(o => o.customerId === customerId);
  res.json(customerOrders);
});

app.get('/api/orders/search', validateToken, (req, res) => {
  const { q } = req.query;
  if (!q) return res.json(orders);
  const filtered = orders.filter(o => 
    o.orderId.toLowerCase().includes(q.toLowerCase()) ||
    o.customer.toLowerCase().includes(q.toLowerCase())
  );
  res.json(filtered);
});

// Search orders for autocomplete (últimos 45 dias)
app.get('/api/search/orders', validateToken, (req, res) => {
  const { q } = req.query;
  
  // Calcular data de 45 dias atrás
  const fortyFiveDaysAgo = new Date();
  fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);
  
  // Filtrar pedidos dos últimos 45 dias
  let recentOrders = orders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate >= fortyFiveDaysAgo;
  });
  
  // Se houver query, filtrar por nome/email/número do pedido
  if (q && q.trim()) {
    const searchTerm = q.toLowerCase().trim();
    recentOrders = recentOrders.filter(order => 
      order.orderNumber.toLowerCase().includes(searchTerm) ||
      order.customerName.toLowerCase().includes(searchTerm) ||
      order.customerEmail.toLowerCase().includes(searchTerm)
    );
  }
  
  // Ordenar por data mais recente primeiro
  recentOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Limitar a 10 resultados
  const results = recentOrders.slice(0, 10);
  
  console.log(`[Search Orders] Query: "${q || 'all'}", Found: ${results.length} results`);
  
  res.json(results);
});

// ==================== WORDPRESS ACCOUNTS ====================

app.get('/api/wordpress-accounts', validateToken, (req, res) => {
  res.json(wordpressAccounts);
});

app.get('/api/wordpress-accounts/:id', validateToken, (req, res) => {
  const account = wordpressAccounts.find(a => a.id === parseInt(req.params.id));
  if (!account) return res.status(404).json({ error: 'WordPress account not found' });
  res.json(account);
});

app.get('/api/wordpress-accounts/search', validateToken, (req, res) => {
  const { q } = req.query;
  if (!q) return res.json(wordpressAccounts);
  const filtered = wordpressAccounts.filter(a => 
    a.username.toLowerCase().includes(q.toLowerCase()) ||
    a.email.toLowerCase().includes(q.toLowerCase())
  );
  res.json(filtered);
});

// ==================== POSTS ====================

app.get('/api/posts', validateToken, (req, res) => {
  const { platform } = req.query;
  let filtered = [...posts];
  if (platform) filtered = filtered.filter(p => p.platform === platform);
  res.json(filtered);
});

app.get('/api/posts/:id', validateToken, (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// ==================== ANALYTICS ====================

app.get('/api/analytics/action-choices', validateToken, (req, res) => {
  const stats = {
    total: userActionChoices.length,
    aiAccepted: userActionChoices.filter(a => a.actionType === 'ai_accepted').length,
    aiEdited: userActionChoices.filter(a => a.actionType === 'ai_edited').length,
    manual: userActionChoices.filter(a => a.actionType === 'manual').length
  };
  res.json({ stats, choices: userActionChoices });
});

app.get('/api/analytics/dashboard', validateToken, (req, res) => {
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

app.get('/api/settings', validateToken, (req, res) => {
  res.json(settings);
});

app.patch('/api/settings', validateToken, (req, res) => {
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
