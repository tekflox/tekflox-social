# TekFlox Social - AI Context Instructions

Este arquivo contém informações essenciais sobre o projeto para fornecer contexto adequado a assistentes de IA.

---

## 📋 Visão Geral do Projeto

**Nome:** TekFlox Social  
**Tipo:** Aplicação web de gerenciamento de redes sociais com IA  
**Arquitetura:** Frontend React + Mock Server Express.js  
**Propósito:** Gerenciar conversas de Instagram, Facebook e WhatsApp com sugestões de IA e integração WooCommerce

---

## 🗂️ Estrutura do Repositório

```
tekflox-social/
├── README.md                    # Documentação principal (1,683 linhas)
├── package.json                 # Dependências e scripts npm
├── vite.config.js              # Configuração Vite
├── tailwind.config.js          # Configuração Tailwind CSS
├── postcss.config.js           # Configuração PostCSS
├── index.html                  # HTML template
│
├── docs/                       # 📚 DOCUMENTAÇÃO COMPLETA
│   ├── README.md              # Índice da documentação
│   ├── DOCUMENTATION_INDEX.md # Índice central navegável
│   ├── API.md                 # Referência completa API (20+ endpoints)
│   └── API_DOCUMENTATION.md   # Documentação API legado
│
├── src/                        # 💻 CÓDIGO FRONTEND
│   ├── main.jsx               # Ponto de entrada React
│   ├── App.jsx                # Componente raiz + rotas
│   ├── index.css              # Estilos globais Tailwind
│   │
│   ├── pages/                 # Páginas principais
│   │   ├── Dashboard.jsx      # Página inicial com stats
│   │   ├── Conversations.jsx  # Interface Facebook Messenger (979 linhas)
│   │   └── Settings.jsx       # Configurações
│   │
│   ├── components/            # Componentes reutilizáveis
│   │   ├── ConversationCard.jsx  # Card de conversa
│   │   ├── Layout.jsx            # Layout com sidebar VS Code
│   │   └── [outros]
│   │
│   ├── contexts/              # Estado global
│   │   └── AppContext.jsx     # Context API provider
│   │
│   └── services/              # Serviços
│       └── api.js             # Cliente HTTP (Axios)
│
├── mock-server/                # 🔧 BACKEND MOCK
│   └── server.js              # Express server (566 linhas, 20+ endpoints)
│
└── public/                     # Assets estáticos
```

---

## 🚀 Como Executar

### Instalação
```bash
npm install
```

### Desenvolvimento (2 terminais)
```bash
# Terminal 1 - Mock Server (porta 3001)
npm run mock-server

# Terminal 2 - Frontend (porta 5173)
npm run dev
```

### Acessar (Desenvolvimento)
- **Frontend:** http://localhost:5173
- **API Mock:** http://localhost:3001
- **Health Check:** http://localhost:3001/api/health

### Produção (Deploy)
- **Vercel (Backend + Frontend):** https://tekflox-social.vercel.app
- **Vercel API:** https://tekflox-social.vercel.app/api
- **GitHub Pages (Frontend):** https://tekflox.github.io/tekflox-social

### Build e Deploy
```bash
npm run build          # Build de produção
npm run preview        # Preview do build
npm run deploy         # Deploy GitHub Pages (frontend)
npm run deploy:vercel  # Deploy Vercel (backend + frontend)
```

### Testes
```bash
npm test              # Executar testes Vitest
npm run test:ui       # UI interativa de testes
npm run test:coverage # Coverage report
```

---

## 🏗️ Arquitetura Técnica

### Frontend Stack

**Framework e Build:**
- **React 18.2.0** - Biblioteca UI com hooks (useState, useEffect, useContext)
- **Vite 5.4.20** - Build tool ultra-rápido com Hot Module Replacement (HMR)
- **React Router DOM 6.20.0** - Roteamento client-side (BrowserRouter, Routes, Route)

**Estilização:**
- **Tailwind CSS 3.3.6** - Framework CSS utility-first
- **PostCSS** - Processador CSS para Tailwind
- **Configuração:** `tailwind.config.js` com cores customizadas

**HTTP e Estado:**
- **Axios** - Cliente HTTP para chamadas API
- **Context API** - Gerenciamento de estado global (AppContext)

**Ícones:**
- **Lucide React** - Biblioteca de ícones SVG

### Backend Mock

**Framework:**
- **Express.js 4.18.2** - Framework web minimalista Node.js
- **CORS** - Middleware para permitir requisições cross-origin
- **Nodemon** - Auto-restart em mudanças de arquivo (desenvolvimento)

**Armazenamento:**
- **Em memória** - Dados resetam a cada restart do servidor
- Arrays e objetos JavaScript para simular banco de dados

**Endpoints:** 20+ APIs RESTful documentadas em `docs/API.md`

### Arquitetura de Deploy (Produção)

O projeto usa uma arquitetura dual-deployment:

**1. Vercel (Backend + Frontend)**
- URL: `https://tekflox-social.vercel.app`
- Backend API: `https://tekflox-social.vercel.app/api`
- Express.js rodando como serverless functions
- Configurado via `vercel.json`
- Health check: `/api/health`

**2. GitHub Pages (Frontend Only)**
- URL: `https://tekflox.github.io/tekflox-social`
- Frontend estático (React build)
- API aponta para Vercel backend
- Configurado via `gh-pages` package
- Base path: `/tekflox-social/`
- **IMPORTANTE:** React Router precisa de `basename`:
  ```jsx
  <BrowserRouter basename="/tekflox-social">
  ```

**Detecção de Ambiente (`src/services/api.js`):**
```javascript
const BASE_URL = import.meta.env.PROD 
  ? 'https://tekflox-social.vercel.app/api'  // GitHub Pages → Vercel
  : 'http://localhost:3001/api';  // Local dev
```

**Vantagens:**
- GitHub Pages: Free static hosting, iframe-embeddable
- Vercel: Serverless backend, 100GB bandwidth free tier
- Separation of concerns: frontend e backend independentes
- CORS configurado automaticamente

---

## 🎨 CSS e Estilização (IMPORTANTE)

### Tailwind CSS Utility-First

O projeto usa **Tailwind CSS 3.3.6**, um framework utility-first que aplica classes diretamente no JSX.

#### Exemplo de Uso:
```jsx
<div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
  <span className="text-white font-semibold">Mensagem IA</span>
</div>
```

#### Classes Mais Usadas no Projeto:

**Layout:**
- `flex` - Display flex
- `flex-1` - Flex grow 1 (ocupa espaço disponível)
- `items-center` - Align items center
- `justify-between` - Justify content space-between
- `gap-4` - Gap de 1rem (16px)
- `h-screen` - Height 100vh
- `w-16`, `w-48`, `w-80` - Larguras fixas (64px, 192px, 320px)

**Cores (Paleta do Projeto):**
- **IA Messages:** `bg-gradient-to-r from-purple-500 to-pink-500` (roxo → rosa)
- **Manual Messages:** `bg-blue-500` (azul sólido)
- **Backgrounds:** `bg-gray-50`, `bg-gray-100`, `bg-gray-900`
- **Sidebar:** `bg-gray-900` (cinza escuro)
- **AI Insights:** `bg-gradient-to-br from-purple-50 to-pink-50` (gradiente suave)

**Espaçamento:**
- `p-4` - Padding 1rem (16px)
- `px-6` - Padding horizontal 1.5rem
- `py-2` - Padding vertical 0.5rem
- `m-4` - Margin 1rem
- `space-y-4` - Espaço vertical entre filhos

**Tipografia:**
- `text-sm`, `text-base`, `text-lg`, `text-xl` - Tamanhos de fonte
- `font-semibold`, `font-bold` - Pesos de fonte
- `text-white`, `text-gray-600` - Cores de texto

**Borders e Rounded:**
- `rounded-xl` - Border radius 0.75rem
- `rounded-full` - Border radius 100%
- `border`, `border-2` - Espessura de borda
- `border-gray-200` - Cor da borda

**Efeitos:**
- `hover:bg-gray-100` - Hover state
- `transition-all` - Transição suave
- `shadow-lg` - Box shadow grande
- `cursor-pointer` - Cursor de ponteiro

**Responsive (se necessário):**
- `md:flex` - Flex apenas em telas médias+
- `lg:w-1/2` - Width 50% em telas grandes

#### Configuração Customizada (tailwind.config.js):

```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores customizadas podem ser adicionadas aqui
      }
    }
  },
  plugins: []
}
```

#### IMPORTANTE para IA:
1. **NUNCA use CSS inline** (`style={{...}}`) - sempre use classes Tailwind
2. **Classes devem ser strings completas**, não concatenação dinâmica
3. **Use gradientes** para mensagens IA: `bg-gradient-to-r from-purple-500 to-pink-500`
4. **Consistência de espaçamento**: use escala Tailwind (4, 6, 8, 12, 16, etc)
5. **Dark mode não implementado** - apenas light mode por enquanto

---

## 🔑 Conceitos-Chave

### 1. Estrutura de 3 Colunas (Conversations.jsx)

```
┌──────┬─────────────┬──────────────────┬─────────────┐
│ VS   │ Lista de    │ Thread de        │ Painel do   │
│ Code │ Conversas   │ Mensagens        │ Cliente     │
│ Nav  │             │                  │             │
└──────┴─────────────┴──────────────────┴─────────────┘
 16px    320px         flex-1             320px
```

**Implementação:**
```jsx
<div className="flex h-screen">
  {/* Coluna 1: Sidebar Navegação */}
  <div className={sidebarExpanded ? 'w-48' : 'w-16'}>...</div>
  
  {/* Coluna 2: Lista Conversas */}
  <div className="w-80">...</div>
  
  {/* Coluna 3: Thread Mensagens */}
  <div className="flex-1">...</div>
  
  {/* Coluna 4: Painel Cliente */}
  <div className="w-80">...</div>
</div>
```

### 2. Action Types de Mensagens

Cada mensagem enviada pelo agente tem um `actionType`:

- **`ai_accepted`** - Sugestão IA aceita diretamente
  - Cor: Gradiente roxo/rosa
  - Label: ✨ IA Aceita
  
- **`ai_edited`** - Sugestão IA que foi editada
  - Cor: Gradiente roxo/rosa
  - Label: ✏️ IA Editada
  
- **`manual`** - Mensagem escrita manualmente
  - Cor: Azul sólido
  - Label: 📝 Manual

**Código de Diferenciação:**
```javascript
const getMessageColor = () => {
  if (message.sender === 'customer') return 'bg-white border';
  if (message.actionType === 'manual') return 'bg-blue-500';
  return 'bg-gradient-to-r from-purple-500 to-pink-500';
};
```

### 3. Metadata de Conversas

Cada conversa tem metadata separada da conversa principal:

```javascript
{
  aiInsights: [
    { sender: 'ai', text: '...', timestamp: Date }
  ],
  manualNotes: 'string',
  tags: ['tag1', 'tag2'],
  labels: [
    { text: 'Hot Lead', color: 'red' }
  ]
}
```

**Endpoints:**
- GET `/api/conversations/:id/metadata`
- PATCH `/api/conversations/:id/metadata`

### 4. AI Insights Chat

Sistema de chat com IA integrado ao painel do cliente:

**Features:**
- Primeira mensagem: Resumo automático da conversa
- Chat bidirecional: usuário pode fazer perguntas
- Histórico persistido por conversa
- Visual: Gradiente roxo/rosa suave

**Implementação:**
```jsx
<div className="bg-gradient-to-br from-purple-50 to-pink-50">
  {aiInsights.map((message) => (
    <div className={message.sender === 'user' ? 'justify-end' : 'justify-start'}>
      <div className={message.sender === 'user' ? 'bg-blue-500' : 'bg-white'}>
        {message.text}
      </div>
    </div>
  ))}
</div>
```

### 5. Edição Inline

Notas manuais usam padrão de edição inline:

```jsx
{isEditingNotes || !manualNotes ? (
  <textarea
    value={manualNotes}
    onBlur={() => {
      setIsEditingNotes(false);
      saveManualNotes();
    }}
    autoFocus
  />
) : (
  <div onClick={() => setIsEditingNotes(true)}>
    {manualNotes}
    <p className="text-xs">Clique para editar</p>
  </div>
)}
```

### 6. VS Code Style Navigation

Sidebar colapsável em todas as páginas:

```jsx
<div className={`bg-gray-900 ${sidebarExpanded ? 'w-48' : 'w-16'}`}>
  <button onClick={() => setSidebarExpanded(!sidebarExpanded)}>
    {sidebarExpanded ? <ChevronLeft /> : <ChevronRight />}
  </button>
  
  {navItems.map(item => (
    <button onClick={() => navigate(item.path)}>
      <item.icon />
      {sidebarExpanded && <span>{item.label}</span>}
    </button>
  ))}
</div>
```

---

## 📡 Fluxo de Dados

```
User Action (UI)
    ↓
React Component (useState/useEffect)
    ↓
AppContext (useContext)
    ↓
api.js (axios.get/post/patch)
    ↓
Mock Server (Express route handler)
    ↓
In-Memory Data (arrays/objects)
    ↓
JSON Response
    ↓
React Component (setState)
    ↓
Re-render UI
```

**Exemplo Completo:**
```javascript
// 1. User clica em "Enviar" no frontend
const sendMessage = async () => {
  // 2. Chama serviço API
  const response = await api.sendMessage(conversationId, {
    text: messageText,
    actionType: 'manual'
  });
  
  // 3. API faz POST para mock server
  // POST /api/conversations/1/messages
  
  // 4. Mock server processa e retorna
  // Response: { id: 10, text: '...', timestamp: '...' }
  
  // 5. Frontend atualiza estado
  setMessages([...messages, response.data]);
  
  // 6. UI re-renderiza com nova mensagem
};
```

---

## 🗄️ Dados Mock (Mock Server)

### Estrutura de Dados em Memória:

```javascript
// Conversas (5 mockadas)
conversations = [
  {
    id: 1,
    platform: 'instagram',
    contact: { name, username, avatar },
    lastMessage: 'string',
    timestamp: Date,
    status: 'pending' | 'answered' | 'resolved',
    customerId: 1,
    orderId: null,
    summary: 'string'
  }
];

// Mensagens (histórico completo)
messages = [
  {
    id: 1,
    conversationId: 1,
    sender: 'customer' | 'agent',
    text: 'string',
    timestamp: Date,
    actionType: 'ai_accepted' | 'ai_edited' | 'manual'
  }
];

// Metadata (separado das conversas)
conversationMetadata = {
  1: {
    aiInsights: [{ sender, text, timestamp }],
    manualNotes: 'string',
    tags: ['vip', 'urgente'],
    labels: [{ text: 'Hot Lead', color: 'red' }]
  }
};

// Clientes (5 mockados)
customers = [
  { id, name, email, phone, avatar }
];

// Pedidos (5 mockados)
orders = [
  { id, orderId, customer, total, status, date }
];

// Contas WordPress (5 mockadas)
wordpressAccounts = [
  { id, username, email, role, customerId }
];

// Sugestões IA (por conversa)
aiSuggestions = {
  1: {
    suggestion: 'Olá Maria! Sim, temos...',
    confidence: 0.92,
    generatedAt: Date
  }
};
```

**IMPORTANTE:** Dados resetam a cada restart do mock server (não há persistência).

---

## 🔧 Auto-Reload

### Frontend (Vite HMR)
- **Automático** ao salvar arquivos `.jsx`, `.js`, `.css`
- **Instantâneo** - não recarrega página inteira
- **Preserva estado** - React Fast Refresh

### Backend (Nodemon)
- **Automático** ao salvar `mock-server/server.js`
- **Restart completo** em ~1 segundo
- **Dados resetam** - volta aos dados mockados iniciais

**Configuração em package.json:**
```json
{
  "scripts": {
    "dev": "vite",                           // HMR habilitado
    "mock-server": "nodemon mock-server/server.js"  // Auto-restart
  }
}
```

---

## 🧪 Testes

### Status Atual
- **Total:** 49 testes
- **Passando:** 29 (59%)
- **Falhando:** 20 (41%)
- **Motivo:** Estrutura de dados desatualizada nos mocks

### Stack de Testes
- **Vitest** - Test runner (alternativa ao Jest)
- **@testing-library/react** - Testes de componentes
- **jsdom** - DOM environment para testes
- **MSW** (Mock Service Worker) - Mock de APIs

### Executar
```bash
npm test              # Executar todos
npm test -- --watch   # Watch mode
npm run test:ui       # UI interativa
```

---

## 📝 Padrões de Código

### Convenções de Nomenclatura

**Componentes:**
- PascalCase: `ConversationCard.jsx`, `MessageBubble.jsx`
- Props: camelCase

**Funções:**
- camelCase: `sendMessage()`, `loadConversations()`
- Handlers: `handleClick()`, `handleSubmit()`

**Variáveis de Estado:**
- camelCase: `selectedConversation`, `isLoading`
- Boolean: prefixo `is`, `has`, `should`

**CSS Classes:**
- Sempre Tailwind, nunca inline styles
- String completa, não concatenação dinâmica

### Estrutura de Componentes

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import * as api from '../services/api';

export default function ComponentName() {
  // 1. Hooks
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [localState, setLocalState] = useState(null);
  
  // 2. Effects
  useEffect(() => {
    loadData();
  }, []);
  
  // 3. Funções
  const loadData = async () => {
    const data = await api.getData();
    setLocalState(data);
  };
  
  // 4. Handlers
  const handleClick = () => {
    // lógica
  };
  
  // 5. Render
  return (
    <div className="flex flex-col p-4">
      {/* JSX */}
    </div>
  );
}
```

---

## 🚨 Pontos de Atenção para IA

### ❌ NÃO FAZER:

1. **Não use CSS inline:**
   ```jsx
   // ❌ ERRADO
   <div style={{ backgroundColor: 'purple', padding: '16px' }}>
   
   // ✅ CORRETO
   <div className="bg-purple-500 p-4">
   ```

2. **Não concatene classes Tailwind dinamicamente:**
   ```jsx
   // ❌ ERRADO
   const color = 'blue';
   <div className={`bg-${color}-500`}>  // Não funciona!
   
   // ✅ CORRETO
   const bgClass = color === 'blue' ? 'bg-blue-500' : 'bg-red-500';
   <div className={bgClass}>
   ```

3. **Não modifique dados diretamente:**
   ```jsx
   // ❌ ERRADO
   conversations[0].status = 'answered';
   
   // ✅ CORRETO
   setConversations(conversations.map(c => 
     c.id === 1 ? { ...c, status: 'answered' } : c
   ));
   ```

4. **Não faça chamadas API diretas:**
   ```jsx
   // ❌ ERRADO
   const res = await axios.get('http://localhost:3001/api/conversations');
   
   // ✅ CORRETO
   const conversations = await api.getConversations();
   ```

### ✅ SEMPRE FAZER:

1. **Use o serviço api.js:**
   ```javascript
   import * as api from '../services/api';
   const data = await api.getConversations();
   ```

2. **Use Context para estado global:**
   ```javascript
   const { state, dispatch } = useApp();
   ```

3. **Use classes Tailwind completas:**
   ```jsx
   <div className="flex items-center justify-between p-4 bg-gray-100">
   ```

4. **Preserve estrutura de dados:**
   ```javascript
   // Sempre mantenha as propriedades esperadas
   { id, platform, contact, lastMessage, timestamp, status, ... }
   ```

5. **Siga o padrão de cores:**
   - IA: `bg-gradient-to-r from-purple-500 to-pink-500`
   - Manual: `bg-blue-500`
   - Sidebar: `bg-gray-900`

---

## 📚 Documentação Completa

Toda a documentação está em `docs/`:

- **docs/README.md** - Índice da documentação
- **docs/DOCUMENTATION_INDEX.md** - Navegação completa
- **docs/API.md** - Referência de 20+ endpoints
- **README.md** (raiz) - Documentação principal do projeto

**Para qualquer dúvida, consulte primeiro a documentação!**

---

## 🎯 Comandos Essenciais

```bash
# Instalação
npm install

# Desenvolvimento
npm run dev              # Frontend (5173)
npm run mock-server      # Backend (3001)

# Build
npm run build
npm run preview

# Testes
npm test
npm run test:ui
npm run test:coverage

# Verificar erros
npm run lint            # (se configurado)
```

---

## 🔍 Debugging

### Frontend
1. Abra DevTools (F12)
2. Veja Console para erros
3. Network tab para chamadas API
4. React DevTools para componentes

### Backend
1. Console do terminal mostra logs
2. Adicione `console.log()` conforme necessário
3. Health check: http://localhost:3001/api/health

### Problemas Comuns
- **Port in use:** `lsof -ti:5173` e `kill -9 <PID>`
- **Mock server não atualiza:** Reinicie com nodemon
- **CORS error:** Verifique CORS habilitado no server.js
- **GitHub Pages página em branco:** Verifique se `basename` está configurado no BrowserRouter
- **Assets 404 no GitHub Pages:** Certifique-se que `base: '/tekflox-social/'` está no vite.config.js

---

## 🚀 Deploy

### Vercel (Backend + Frontend)
```bash
# Fazer deploy
npm run deploy:vercel

# Ou manualmente com Vercel CLI
vercel --prod
```

**Arquivos importantes:**
- `vercel.json` - Configuração de build e rotas
- `mock-server/server.js` - Exporta `module.exports = app` para serverless

### GitHub Pages (Frontend only)
```bash
# Deploy automático
npm run deploy

# Isso executa:
# 1. npm run build (predeploy)
# 2. gh-pages -d dist
```

**Arquivos importantes:**
- `package.json` - homepage: `https://tekflox.github.io/tekflox-social`
- `vite.config.js` - base: `/tekflox-social/`
- `src/main.jsx` - BrowserRouter com basename
- `public/.nojekyll` - Desabilita Jekyll do GitHub

**CRÍTICO para GitHub Pages:**
```jsx
// src/main.jsx
<BrowserRouter basename="/tekflox-social">
  <App />
</BrowserRouter>
```

Sem o `basename`, React Router não funciona em subdiretórios do GitHub Pages.

---

## 🎓 Para Novas Features

### Checklist ao Adicionar Feature

1. ✅ Entenda o fluxo de dados atual
2. ✅ Adicione endpoint no mock server se necessário
3. ✅ Adicione função em `api.js`
4. ✅ Crie/modifique componente React
5. ✅ Use Tailwind para estilos
6. ✅ Atualize Context se for estado global
7. ✅ Teste manualmente
8. ✅ Adicione testes unitários (futuro)
9. ✅ Documente no README se for feature grande

---

## 📝 Changelog Recente

**Outubro 2025:**
- ✅ Configurado deploy dual: Vercel (backend + frontend) e GitHub Pages (frontend)
- ✅ Fix crítico: Adicionado `basename="/tekflox-social"` ao BrowserRouter para GitHub Pages
- ✅ Removido favicon vite.svg que causava 404
- ✅ Documentação completa de deploy em DEPLOY.md e GITHUB_PAGES.md
- ✅ API em produção: https://tekflox-social.vercel.app/api
- ✅ Frontend embeddable: https://tekflox.github.io/tekflox-social

---

**Este arquivo deve ser lido por qualquer IA que trabalhe no projeto para entender o contexto completo.**

Última atualização: 6 de Outubro de 2025
