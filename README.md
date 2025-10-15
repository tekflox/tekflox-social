# TekFlox Social - Gerenciador de Redes Sociais com IA

<div align="center">

**Aplicação React para gerenciamento unificado de redes sociais com IA**

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.20-646CFF.svg)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.3.6-38B2AC.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.18.2-000000.svg)](https://expressjs.com/)

[![Deploy to Production](https://github.com/tekflox/tekflox-social/actions/workflows/deploy.yml/badge.svg)](https://github.com/tekflox/tekflox-social/actions/workflows/deploy.yml)
[![CI](https://github.com/tekflox/tekflox-social/actions/workflows/ci.yml/badge.svg)](https://github.com/tekflox/tekflox-social/actions/workflows/ci.yml)

[Início Rápido](#-início-rápido) • [API Docs](./docs/API.md) • [Deploy](./DEPLOY.md) • [Telas](#-telas-da-aplicação) • [📚 Docs](./docs/)

**🌐 Aplicações Online:**
- **Frontend + Backend:** [https://tekflox-social.vercel.app](https://tekflox-social.vercel.app)
- **Frontend (GitHub Pages):** [https://tekflox.github.io/tekflox-social](https://tekflox.github.io/tekflox-social)
- **Backend API:** [https://tekflox-social.vercel.app/api](https://tekflox-social.vercel.app/api)

</div>

---

## 📚 Documentação Completa

Este README fornece uma visão geral do projeto. Para documentação técnica completa:

- **📘 [docs/](./docs/)** - Central de documentação
- **🔌 [docs/API.md](./docs/API.md)** - Referência completa da API (20+ endpoints)
- **🗂️ [docs/DOCUMENTATION_INDEX.md](./docs/DOCUMENTATION_INDEX.md)** - Índice navegável
- **🚀 [DEPLOY.md](./DEPLOY.md)** - Guia de deploy Vercel (backend + frontend)
- **📄 [GITHUB_PAGES.md](./GITHUB_PAGES.md)** - Deploy GitHub Pages (frontend)
- **⚙️ [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)** - CI/CD automático com GitHub Actions
- **🤖 [instructions/tekflox-social.instructions.md](./instructions/tekflox-social.instructions.md)** - Contexto para IA

---

## 📑 Índice

1. [Visão Geral](#-visão-geral)
2. [Início Rápido](#-início-rápido)
3. [Arquitetura](#-arquitetura)
4. [Funcionalidades](#-funcionalidades-detalhadas)
5. [API Mock Server](#-api-mock-server---documentação-completa)
   - [Conversas](#-conversas-conversations)
   - [Metadata](#-metadata-tags-labels-notas-ai-insights)
   - [Mensagens](#-mensagens-messages)
   - [IA](#-sugestões-de-ia)
   - [Dashboard/Analytics](#-dashboard-e-analytics)
   - [Clientes](#-clientes-customers)
   - [Pedidos](#-pedidos-orders)
   - [WordPress](#-contas-wordpress)
6. [Telas da Aplicação](#-telas-da-aplicação)
7. [Roadmap](#-roadmap-de-desenvolvimento)
8. [Configuração](#-configuração-e-desenvolvimento)
9. [Troubleshooting](#-troubleshooting)
10. [Testing](#-testing)
11. [Contribuindo](#-contribuindo)

---

## 📌 Visão Geral

Aplicação React para gerenciamento unificado de redes sociais (Instagram, Facebook, WhatsApp) com sugestões de resposta por IA, integração com WooCommerce e interface estilo Facebook Messenger com recursos avançados de gestão de conversas.

### ✨ Principais Funcionalidades

- 💬 **Interface estilo Facebook Messenger** com layout de 3 colunas
- 🤖 **Sugestões de resposta por IA** com 3 modos (Aceitar/Editar/Manual)
- 🛍️ **Integração WooCommerce** - vinculação de conversas com clientes e pedidos
- 🧠 **Chat com IA** - conversa inteligente com resumo automático da conversa
- 🏷️ **Sistema de Tags e Etiquetas** com cores personalizáveis
- 📝 **Notas manuais** com edição inline
- 🎨 **Diferenciação visual** - mensagens IA (roxo/rosa), manuais (azul)
- 🗂️ **Navegação estilo VS Code** com sidebar colapsável
- 🔄 **Auto-reload** - frontend (Vite HMR) e backend (Nodemon)

### 🎯 Casos de Uso

- **E-commerce**: Atendimento unificado de clientes de múltiplas plataformas
- **Suporte**: Gestão eficiente de tickets com sugestões IA
- **Vendas**: Conversão de leads com contexto WooCommerce
- **Marketing**: Resposta rápida em campanhas de redes sociais

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 16+ 
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/yourusername/tekflox-social.git
cd tekflox-social

# Instale as dependências
npm install
```

### Executando a Aplicação

#### Opção 1: Tudo de uma vez (recomendado) ⚡

```bash
# Inicia backend + frontend em um único terminal
npm run dev:all
# ou simplesmente
npm start
```

Isso vai iniciar:
- 🔵 **API** - Mock Server na porta 3002
- 🔮 **WEB** - Frontend Vite na porta 5173

Com logs coloridos e organizados em um único terminal!

#### Opção 2: Terminais separados (para debug detalhado)

```bash
# Terminal 1 - Mock Server (porta 3002)
npm run mock-server

# Terminal 2 - Frontend React (porta 5173)
npm run dev
```

#### Opção 3: Comandos individuais

```bash
# Apenas frontend
npm run dev

# Apenas backend
npm run dev:backend
# ou
npm run mock-server

# Build para produção
npm run build

# Preview do build
npm run preview

# Executar testes
npm test
```

### Acessando a Aplicação

- **Frontend**: http://localhost:5173
- **Mock Server API**: http://localhost:3002
- **Health Check**: http://localhost:3002/api/health

## 🚀 Deploy e Produção

O projeto está configurado para deploy em duas plataformas:

### Vercel (Backend + Frontend)
- **URL**: https://tekflox-social.vercel.app
- **Backend API**: https://tekflox-social.vercel.app/api
- **Configuração**: Express.js como serverless functions
- **Documentação**: [DEPLOY.md](./DEPLOY.md)

### GitHub Pages (Frontend estático)
- **URL**: https://tekflox.github.io/tekflox-social
- **Backend**: Usa API do Vercel
- **Uso**: Iframe-embeddable para outros sites
- **Documentação**: [GITHUB_PAGES.md](./GITHUB_PAGES.md)

**Deploy rápido:**
```bash
# Vercel (ambos frontend e backend)
npm run deploy:vercel

# GitHub Pages (apenas frontend)
npm run deploy
```

**Arquitetura de Produção:**
```
┌──────────────────────────────────────────┐
│  GitHub Pages (Frontend estático)        │
│  https://tekflox.github.io/tekflox-social│
└────────────────┬─────────────────────────┘
                 │ API Calls
                 ▼
┌──────────────────────────────────────────┐
│  Vercel (Backend serverless)             │
│  https://tekflox-social.vercel.app/api   │
└──────────────────────────────────────────┘
```

**IMPORTANTE:** React Router no GitHub Pages requer `basename`:
```jsx
<BrowserRouter basename="/tekflox-social">
  <App />
</BrowserRouter>
```

## 🏗️ Arquitetura

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vite)                          │
│                     http://localhost:5173                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Dashboard   │  │ Conversations│  │   Settings   │         │
│  │   Page       │  │     Page     │  │     Page     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                            │                                     │
│                    ┌───────▼────────┐                          │
│                    │  AppContext    │  (Estado Global)         │
│                    │  (React Context)│                         │
│                    └───────┬────────┘                          │
│                            │                                     │
│                    ┌───────▼────────┐                          │
│                    │   api.js       │  (HTTP Client)           │
│                    │   (Axios)      │                          │
│                    └───────┬────────┘                          │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             │ HTTP/REST
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    MOCK SERVER (Express)                        │
│    Dev: http://localhost:3002                                   │
│    Prod: https://tekflox-social.vercel.app/api                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    API ENDPOINTS                         │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  /api/conversations         (GET, PATCH, POST)          │  │
│  │  /api/conversations/:id/messages  (GET, POST)           │  │
│  │  /api/conversations/:id/metadata  (GET, PATCH)          │  │
│  │  /api/ai/suggestion/:id     (GET)                       │  │
│  │  /api/customers             (GET, SEARCH)               │  │
│  │  /api/orders                (GET, SEARCH)               │  │
│  │  /api/wordpress-accounts    (GET, SEARCH)               │  │
│  │  /api/analytics/*           (GET)                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  IN-MEMORY DATA                          │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  • conversations[]      (5 conversas)                   │  │
│  │  • messages[]           (histórico de mensagens)        │  │
│  │  • conversationMetadata{}  (tags, notas, chat com IA)   │  │
│  │  • customers[]          (5 clientes)                    │  │
│  │  • orders[]             (5 pedidos)                     │  │
│  │  • wordpressAccounts[]  (5 contas)                      │  │
│  │  • aiSuggestions{}      (sugestões IA mockadas)         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

FUTURO: Integrações Reais
┌─────────────────────────────────────────────────────────────────┐
│  WordPress/WooCommerce  │  Instagram API  │  Facebook API       │
│  WhatsApp Business API  │  OpenAI/Claude  │  PostgreSQL/MongoDB │
└─────────────────────────────────────────────────────────────────┘
```

### Stack Frontend
- **React 18.2.0** - Biblioteca UI com hooks
- **Vite 5.4.20** - Build tool com Hot Module Replacement
- **Tailwind CSS 3.3.6** - Estilização utility-first
- **React Router DOM 6.20.0** - Roteamento client-side
- **Lucide React** - Biblioteca de ícones
- **Axios** - Cliente HTTP para API

### Stack Backend (Mock Server)
- **Express.js 4.18.2** - Framework web Node.js
- **CORS** - Habilitado para desenvolvimento
- **Nodemon** - Auto-reload em alterações de código
- **Armazenamento em memória** - Dados mockados temporários

### Fluxo de Dados

```
User Action (UI)
    ↓
React Component
    ↓
AppContext (State Update)
    ↓
api.js (HTTP Request)
    ↓
Mock Server (Express Route)
    ↓
In-Memory Data (CRUD)
    ↓
HTTP Response (JSON)
    ↓
React Component (Re-render)
    ↓
UI Update
```

### Estrutura de Pastas

```
tekflox-social/
├── src/
│   ├── components/
│   │   ├── ConversationCard.jsx    # Card de conversa na lista
│   │   ├── Layout.jsx              # Layout com sidebar VS Code
│   │   └── [outros componentes]
│   ├── contexts/
│   │   └── AppContext.jsx          # Estado global da aplicação
│   ├── pages/
│   │   ├── Dashboard.jsx           # Página inicial com estatísticas
│   │   ├── Conversations.jsx       # Interface estilo Facebook Messenger
│   │   └── Settings.jsx            # Configurações da aplicação
│   ├── services/
│   │   └── api.js                  # Cliente API com todas as chamadas
│   ├── App.jsx                     # Componente raiz e rotas
│   ├── main.jsx                    # Ponto de entrada React
│   └── index.css                   # Estilos globais Tailwind
├── mock-server/
│   └── server.js                   # Express server com 20+ endpoints
├── public/                         # Assets estáticos
├── index.html                      # HTML template
├── vite.config.js                  # Configuração Vite
├── tailwind.config.js              # Configuração Tailwind
├── postcss.config.js               # Configuração PostCSS
└── package.json                    # Dependências e scripts
```

## 🎨 Funcionalidades Detalhadas

### 📊 Dashboard
- Estatísticas em tempo real de conversas
- Visão geral de mensagens pendentes por plataforma
- Taxa de aceitação de sugestões IA
- Cards com gradientes e animações
- Navegação rápida para conversas pendentes

### 💬 Interface de Conversas (Estilo Facebook Messenger)

**Layout de 3 Colunas:**
1. **Sidebar Navegação (VS Code style)**
   - Ícones colapsáveis: Dashboard, Conversas, Settings
   - Largura ajustável (16px colapsado, 48px expandido)
   
2. **Lista de Conversas**
   - Filtros por plataforma: Instagram, Facebook, WhatsApp, Todas
   - Status visual: pendente (unread), respondida, resolvida
   - Avatar, nome, última mensagem, timestamp
   - Badge de contador de mensagens não lidas
   
3. **Thread de Mensagens**
   - Mensagens do cliente (lado esquerdo, fundo branco)
   - Mensagens do agente (lado direito, coloridas)
   - Diferenciação visual por tipo:
     - 💜 **IA Aceita**: Gradiente roxo/rosa
     - ✏️ **IA Editada**: Gradiente roxo/rosa com indicador
     - 📝 **Manual**: Azul sólido
   - Sugestões IA com 3 botões de ação
   
4. **Painel do Cliente**
   - **Dados do Perfil**: Nome, username, plataforma
   - **Chat com IA**: Conversa inteligente sobre o contexto da conversa
     - Primeira mensagem: Resumo automático da conversa
     - Input para perguntas ao AI
     - Histórico de chat persistente
   - **Tags**: Sistema inline com # prefix (adicionar/remover)
   - **Etiquetas**: Labels com cores personalizáveis
   - **Fase do Lead**: Seletor de pipeline (Novo, Qualificado, etc)
   - **Notas Manuais**: Edição inline (clique para editar)
   - **Dados do Cliente WooCommerce**:
     - Email, telefone
     - Pedidos recentes
     - Total gasto
     - Link para perfil WordPress

### 🤖 Sistema de IA

**Sugestões de Resposta:**
- Geradas automaticamente baseadas no contexto da conversa
- 3 modos de ação:
  1. **Aceitar**: Envia a sugestão diretamente
  2. **Editar**: Abre modal para ajustar a resposta
  3. **Manual**: Escreve do zero (oculta sugestão)
- Tracking de qual modo foi utilizado para métricas

**Chat com IA (com Resumo Automático):**
- Resumo inicial automático ao selecionar conversa
- Informações incluídas: nome do cliente, plataforma, status, pedidos vinculados
- Chat interativo para fazer perguntas sobre a conversa
- Respostas contextualizadas com integração OpenAI + MCP Tools
- Histórico salvo por conversa

### 🛍️ Integração WooCommerce

**Vinculação de Dados:**
- Modal de busca para vincular cliente/pedido/conta WordPress
- Busca em tempo real por nome, email, telefone
- Exibição de pedidos recentes com itens e valores
- Status de pedidos (completo, processando, pendente)
- Link direto para perfil do cliente

**Dados Exibidos:**
- Informações do cliente: nome, email, telefone, avatar
- Pedidos recentes: número, total, status, data, itens
- Conta WordPress: username, role, ID
- Histórico completo de interações

### 🏷️ Sistema de Metadata

**Tags:**
- Adição inline digitando com # prefix
- Remoção com clique no X
- Persistência por conversa
- Visual: badges azuis

**Etiquetas (Labels):**
- Cores personalizáveis (verde, vermelho, amarelo, azul, roxo)
- Modo "Gerir" para editar/remover
- Adicionar novas com texto e seletor de cor
- Visual: badges coloridos maiores

**Notas Manuais:**
- Edição inline sem popups
- Clique para editar (mostra textarea)
- Blur para salvar automaticamente
- Texto com quebra de linhas preservada

### 🎨 Design e UX

**Paleta de Cores:**
- IA: Gradiente roxo (#8b5cf6) para rosa (#ec4899)
- Manual: Azul sólido (#3b82f6)
- Backgrounds: Gradientes sutis (purple-50 to pink-50)
- Sidebar: Cinza escuro (#1f2937)

**Responsividade:**
- Layout otimizado para desktop
- Sidebar colapsável para mais espaço
- Colunas com larguras fixas para consistência

**Animações:**
- Hover effects em botões e cards
- Transições suaves em mudanças de estado
- Scroll automático em novo chat message

---

## 🔌 API Mock Server

O projeto inclui um mock server Express.js completo com **20+ endpoints** para desenvolvimento.

### 📋 Documentação Completa da API

**👉 Consulte [docs/API.md](./docs/API.md) para documentação detalhada de todos os endpoints.**

O arquivo API.md contém:
- Request/Response completos de cada endpoint
- Parâmetros (path, query, body)
- Exemplos cURL e JavaScript/Axios
- TypeScript interfaces
- Códigos de erro
- Data models

### 🚀 Quick Start

**Iniciar mock server:**
```bash
npm run mock-server
```

**Base URL:** `http://localhost:3002/api`

**Health Check:**
```bash
curl http://localhost:3002/api/health
# Response: {"status":"ok","message":"Mock server is running!"}
```

### 📊 Endpoints Disponíveis (Resumo)

| Categoria | Endpoints | Descrição |
|-----------|-----------|-----------|
| **Health** | `GET /health` | Status do servidor |
| **Conversas** | `GET/PATCH/POST /conversations/*` | CRUD de conversas |
| **Mensagens** | `GET/POST /conversations/:id/messages` | Histórico e envio |
| **Metadata** | `GET/PATCH /conversations/:id/metadata` | Tags, labels, notas, chat com IA |
| **IA** | `GET /ai/suggestion/:id`, `GET /ai/summary/:id` | Sugestões e resumos |
| **Analytics** | `GET /analytics/*`, `GET /dashboard/pending` | Estatísticas |
| **Clientes** | `GET /customers/*`, `GET /customers/search` | CRUD clientes |
| **Pedidos** | `GET /orders/*`, `GET /orders/search` | CRUD pedidos |
| **WordPress** | `GET /wordpress-accounts/*` | Contas WP |
| **Posts** | `GET /posts/*` | Posts de redes sociais |
| **Settings** | `GET/PATCH /settings` | Configurações |

### 💾 Dados Mock

O servidor mantém em memória:
- 5 conversas (Instagram, Facebook, WhatsApp)
- 5 clientes com avatares
- 5 pedidos vinculados
- 5 contas WordPress
- Metadata por conversa (tags, labels, notas, chat com IA)
- Histórico completo de mensagens
- Sugestões IA para cada conversa

**⚠️ Importante:** Dados resetam a cada restart do servidor.

### 🔄 Auto-Reload

O mock server usa **Nodemon** para reiniciar automaticamente quando arquivos são alterados:
- Monitora `mock-server/server.js`
- Restart automático em ~1 segundo
- Dados em memória são resetados a cada restart
- Para produção, implementar persistência (banco de dados)

### 📚 Exemplo de Uso

**JavaScript/Axios:**
```javascript
// Listar conversas pendentes do Instagram
const response = await axios.get('http://localhost:3002/api/conversations', {
  params: { platform: 'instagram', status: 'pending' }
});

// Enviar mensagem manual
await axios.post('http://localhost:3002/api/conversations/1/messages', {
  text: 'Olá! Como posso ajudar?',
  actionType: 'manual'
});

// Atualizar metadata
await axios.patch('http://localhost:3002/api/conversations/1/metadata', {
  tags: ['vip', 'urgente'],
  manualNotes: 'Cliente importante'
});
```

**cURL:**
```bash
# Listar conversas
curl http://localhost:3002/api/conversations

# Buscar conversa específica com dados enriquecidos
curl http://localhost:3002/api/conversations/1

# Obter sugestão IA
curl http://localhost:3002/api/ai/suggestion/1
```

### 🔗 Mais Informações

Para documentação completa com todos os detalhes:
- **[docs/API.md](./docs/API.md)** - Referência completa de 20+ endpoints
- **[docs/DOCUMENTATION_INDEX.md](./docs/DOCUMENTATION_INDEX.md)** - Índice navegável

---

## 📱 Telas da Aplicação

### 1. Dashboard
**Rota:** `/`

**Elementos:**
- Sidebar de navegação (VS Code style) com ícones
- Cards de estatísticas com gradientes
- Métricas: Total de conversas, pendentes, respondidas, resolvidas
- Breakdown por plataforma (Instagram, Facebook, WhatsApp)
- Layout responsivo com Tailwind

### 2. Conversas (Página Principal)
**Rota:** `/conversations`

**Layout de 3 Colunas:**

**Coluna 1 - Sidebar Navegação (16px-48px):**
- Ícone Dashboard (clicável)
- Ícone Conversas (ativo)
- Ícone Settings (clicável)
- Botão expandir/colapsar

**Coluna 2 - Lista de Conversas (320px):**
- Filtros de plataforma no topo (Instagram, Facebook, WhatsApp, Todas)
- Cards de conversas com:
  - Avatar do contato
  - Nome e username
  - Última mensagem (preview)
  - Timestamp relativo
  - Badge de unread
  - Indicador de status (pendente/respondida/resolvida)
- Scroll vertical
- Seleção ativa (fundo destacado)

**Coluna 3 - Thread de Mensagens (flex-1):**
- Header com informações do contato
- Área de mensagens:
  - Mensagens do cliente (esquerda, branco)
  - Mensagens do agente (direita, coloridas)
  - Diferenciação visual por actionType
  - Timestamps
- Card de sugestão IA (quando disponível):
  - Texto da sugestão
  - Indicador de confiança
  - 3 botões: Aceitar, Editar, Manual
- Input de mensagem manual (parte inferior)

**Coluna 4 - Painel do Cliente (320px):**
- **Seção Dados do Perfil:**
  - Avatar grande
  - Nome completo
  - Username/Telefone
  - Plataforma
  - Status da conversa
  
- **Seção Chat com IA (com Resumo):**
  - Gradiente roxo/rosa de fundo
  - Mensagens do AI (esquerda, branco)
  - Mensagens do usuário (direita, azul)
  - Input para perguntas
  - Auto-scroll para última mensagem
  
- **Seção Tags:**
  - Input inline com # prefix
  - Badges azuis clicáveis
  - Adicionar/remover instantaneamente
  
- **Seção Etiquetas:**
  - Botão "Gerir Etiquetas"
  - Labels coloridos (verde, vermelho, amarelo, azul, roxo)
  - Modal para adicionar com seletor de cor
  
- **Seção Fase do Lead:**
  - Dropdown com opções do pipeline
  - Visual com ícone de funil
  
- **Seção Notas:**
  - Clique para editar (mostra textarea)
  - Blur para salvar
  - Preserva quebras de linha
  - Indicador "Clique para editar"
  
- **Seção Cliente WooCommerce:**
  - Botão "Vincular Cliente/Pedido"
  - Modal de busca com 3 tabs
  - Exibição de cliente vinculado
  - Lista de pedidos com status
  - Link para perfil WordPress

### 3. Settings
**Rota:** `/settings`

**Elementos:**
- Sidebar de navegação (VS Code style)
- Área de configurações:
  - Preferências de IA
  - Configurações de notificação
  - Integrações com plataformas
  - Configurações de conta
- Layout com cards organizados

---

## 🎯 Roadmap de Desenvolvimento

### ✅ Fase 1 - MVP (Completo)
- [x] Interface React com Vite
- [x] Mock server com Express e Nodemon
- [x] Sistema de sugestões IA com 3 modos
- [x] Dashboard com estatísticas
- [x] Interface estilo Facebook Messenger
- [x] Sistema de tags, etiquetas e notas
- [x] Chat com IA (com resumo automático)
- [x] Integração mock WooCommerce
- [x] Auto-reload frontend e backend

### 🔄 Fase 2 - Testes e Qualidade (Em Progresso)
- [ ] Corrigir 20 testes unitários falhando
- [ ] Adicionar testes para novos componentes
- [ ] Testes E2E com Playwright
- [ ] Coverage de 80%+
- [ ] CI/CD pipeline

### 🚀 Fase 3 - Integrações Reais
**Backend WordPress/WooCommerce:**
- [ ] Plugin WordPress personalizado
- [ ] REST API autenticada
- [ ] Custom post types para conversas
- [ ] Webhook handlers
- [ ] Sincronização de clientes/pedidos
- [ ] OAuth 2.0 authentication

**Redes Sociais:**
- [ ] Instagram Graph API
  - Mensagens diretas
  - Comentários em posts
  - Webhooks de novos messages
- [ ] Facebook Graph API
  - Messenger integration
  - Comentários em posts/páginas
  - Webhooks
- [ ] WhatsApp Business API
  - Mensagens via Cloud API
  - Templates aprovados
  - Media messages (imagens, documentos)

### 🤖 Fase 4 - IA Avançada
- [ ] Integração OpenAI/Claude API real
- [ ] Fine-tuning com histórico de conversas
- [ ] Análise de sentimento em tempo real
- [ ] Sugestões contextuais baseadas em:
  - Histórico de compras
  - Produtos em carrinho
  - Comportamento do cliente
- [ ] Auto-resposta para perguntas frequentes
- [ ] Detecção de intent (vendas, suporte, reclamação)
- [ ] Resumos automáticos de conversas longas

### 🎨 Fase 5 - Features Avançadas
- [ ] **Real-time:**
  - Typing indicators (cliente digitando...)
  - Read receipts (mensagem lida)
  - Online status (cliente online/offline)
  - Message delivery status
  
- [ ] **Colaboração em Equipe:**
  - Múltiplos agentes
  - Atribuição de conversas
  - Notas internas (não visíveis ao cliente)
  - Histórico de transferências
  
- [ ] **Automação:**
  - Regras de roteamento
  - Horário de atendimento
  - Respostas rápidas (shortcuts)
  - Chatbot para FAQs
  
- [ ] **Analytics Avançado:**
  - Tempo médio de resposta
  - Taxa de resolução
  - CSAT (Customer Satisfaction Score)
  - Dashboard de performance por agente
  - Relatórios exportáveis (PDF/CSV)

### 📊 Fase 6 - Escalabilidade
- [ ] Migração para banco de dados real (PostgreSQL/MongoDB)
- [ ] Redis para cache e sessions
- [ ] Queue system (Bull/RabbitMQ) para processamento assíncrono
- [ ] Microservices architecture
- [ ] Deploy em cloud (AWS/Azure/GCP)
- [ ] CDN para assets
- [ ] Load balancing
- [ ] Monitoring e logging (Sentry, LogRocket)

## 🔧 Configuração e Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia Vite dev server (porta 5173)
npm run mock-server      # Inicia mock server com nodemon (porta 3002)

# Build e Preview
npm run build            # Build de produção (pasta dist/)
npm run preview          # Preview do build local

# Testes
npm test                 # Executa testes com Vitest
npm run test:ui          # UI interativa de testes
npm run test:coverage    # Relatório de coverage
```

### Variáveis de Ambiente

Para configuração futura, crie `.env` na raiz:

```env
# API
VITE_API_URL=http://localhost:3002
VITE_WP_URL=https://seu-wordpress.com

# IA
VITE_AI_PROVIDER=openai
VITE_AI_API_KEY=sua-chave-api
VITE_AI_MODEL=gpt-4

# Redes Sociais
VITE_INSTAGRAM_APP_ID=seu-app-id
VITE_INSTAGRAM_APP_SECRET=seu-app-secret
VITE_FACEBOOK_APP_ID=seu-app-id
VITE_FACEBOOK_APP_SECRET=seu-app-secret
VITE_WHATSAPP_PHONE_NUMBER_ID=seu-phone-id
VITE_WHATSAPP_ACCESS_TOKEN=seu-token
```

### Personalização do Tema

Edite `tailwind.config.js` para customizar cores:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Cores personalizadas da IA
        'ai-purple': '#8b5cf6',
        'ai-pink': '#ec4899',
        'ai-blue': '#3b82f6',
        
        // Adicione suas cores aqui
        brand: {
          primary: '#your-color',
          secondary: '#your-color',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  }
}
```

### Estrutura de Componentes

```
src/components/
├── ConversationCard.jsx    # Card na lista de conversas
├── MessageBubble.jsx        # Bolha de mensagem individual
├── AISuggestionCard.jsx     # Card com sugestão da IA
├── LinkingModal.jsx         # Modal de vincular cliente/pedido
├── Layout.jsx               # Wrapper com sidebar navegação
└── [futuros componentes]
```

### Integração com IA Real

Para substituir as respostas mockadas por IA real, edite `src/pages/Conversations.jsx`:

```javascript
// Substitua a função sendAIInsightMessage
const sendAIInsightMessage = async () => {
  if (!aiInsightInput.trim()) return;
  
  const userMessage = { sender: 'user', text: aiInsightInput, timestamp: new Date() };
  const updatedInsights = [...aiInsights, userMessage];
  
  // SUBSTITUA ESTA PARTE pela chamada real à API de IA
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_AI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Você é um assistente de atendimento ao cliente...' },
        { role: 'user', content: aiInsightInput }
      ]
    })
  });
  
  const data = await response.json();
  const aiResponse = {
    sender: 'ai',
    text: data.choices[0].message.content,
    timestamp: new Date()
  };
  
  updatedInsights.push(aiResponse);
  await api.updateConversationMetadata(conversationId, { aiInsights: updatedInsights });
  setAiInsights(updatedInsights);
  setAiInsightInput('');
};
```

## 📊 Métricas e Analytics

### Dados Coletados Automaticamente

O sistema registra:
- **Modo de resposta**: IA Aceita, IA Editada ou Manual
- **Timestamp**: Data e hora de cada ação
- **Conversa**: ID da conversa relacionada
- **Plataforma**: Instagram, Facebook ou WhatsApp
- **Status**: Pendente, Respondida ou Resolvida

### Acessando Analytics

```javascript
// Via API
GET /api/analytics/action-choices
GET /api/analytics/dashboard

// Resposta exemplo
{
  "stats": {
    "total": 25,
    "aiAccepted": 15,      // 60% de aceitação
    "aiEdited": 5,         // 20% editada
    "manual": 5            // 20% manual
  }
}
```

### Métricas Futuras (Fase 5)

- Tempo médio de primeira resposta
- Tempo médio de resolução
- Taxa de satisfação do cliente (CSAT)
- Volume de mensagens por hora/dia
- Performance por agente
- Taxa de conversão (conversa → pedido)

## 🔒 Segurança e Boas Práticas

### Atual (Mock)
- CORS habilitado para desenvolvimento
- Dados em memória (sem persistência)
- Sem autenticação (mock server aberto)

### Produção (Futuro)
- **Autenticação**: JWT tokens via WordPress OAuth
- **Autorização**: Role-based access control (RBAC)
- **Sanitização**: Validação de inputs com Joi/Yup
- **Rate Limiting**: Express rate limiter (100 req/min)
- **HTTPS**: Obrigatório em produção
- **Secrets**: Environment variables nunca commitadas
- **CORS**: Whitelist de domínios permitidos
- **XSS Protection**: Sanitização de HTML em mensagens
- **SQL Injection**: Prepared statements no WordPress
- **Logs**: Sem dados sensíveis (mascarar emails/telefones)

## � Troubleshooting

### Erro: "Port 5173 already in use"
```bash
# Encontre e mate o processo
lsof -ti:5173 | xargs kill -9

# Ou mude a porta no vite.config.js
export default {
  server: { port: 3000 }
}
```

### Erro: "Port 3002 already in use"
```bash
# Encontre e mate o processo
lsof -ti:3002 | xargs kill -9

# Ou mude a porta no mock-server/server.js
const PORT = 3002;
```

### Mock Server não recarrega automaticamente
```bash
# Verifique se nodemon está instalado
npm list nodemon

# Reinstale se necessário
npm install --save-dev nodemon

# Verifique o script no package.json
"mock-server": "nodemon mock-server/server.js"
```

### Dados não persistem entre reloads
- **Esperado**: Mock server usa memória, dados resetam a cada restart
- **Solução**: Para persistência, integrar banco de dados (Fase 6)

### Sugestões IA sempre iguais
- **Esperado**: Mock server retorna sugestões pré-definidas
- **Solução**: Integrar API real de IA (Fase 4)

### Erros de CORS
```javascript
// Adicione no mock-server/server.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

## 📚 Recursos e Referências

### Documentação Oficial
- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Express.js](https://expressjs.com/)

### APIs de Redes Sociais
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api/)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api/)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/)

### APIs de IA
- [OpenAI API](https://platform.openai.com/docs/)
- [Anthropic Claude](https://docs.anthropic.com/)
- [Google Gemini](https://ai.google.dev/)

### WordPress/WooCommerce
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [WooCommerce REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/)

## 🧪 Testing

### Executar Testes
```bash
# Todos os testes
npm test

# Watch mode
npm test -- --watch

# Com coverage
npm run test:coverage

# UI interativa
npm run test:ui
```

### Estrutura de Testes
```
src/
├── components/
│   ├── ConversationCard.jsx
│   └── ConversationCard.test.jsx
├── pages/
│   ├── Dashboard.jsx
│   └── Dashboard.test.jsx
└── services/
    ├── api.js
    └── api.test.js
```

### Status Atual
- ⚠️ 20 testes falhando de 49 totais
- 🔄 Precisa atualizar mocks para nova estrutura de dados
- 📝 Adicionar testes para Chat com IA, Tags, Labels

## 🔄 Fluxo de Trabalho Git

```bash
# Feature nova
git checkout -b feature/nome-da-feature
git add .
git commit -m "feat: descrição da feature"
git push origin feature/nome-da-feature

# Bug fix
git checkout -b fix/nome-do-bug
git add .
git commit -m "fix: descrição do fix"
git push origin fix/nome-do-bug

# Hotfix
git checkout -b hotfix/nome-do-hotfix
git add .
git commit -m "hotfix: descrição urgente"
git push origin hotfix/nome-do-hotfix
```

### Convenção de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação (sem mudança de código)
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de build/ferramentas

## 🤝 Contribuindo

### Como Contribuir

1. **Fork** o projeto
2. **Clone** seu fork: `git clone https://github.com/seu-usuario/tekflox-social.git`
3. **Crie uma branch**: `git checkout -b feature/MinhaFeature`
4. **Commit** suas mudanças: `git commit -m 'feat: Adiciona MinhaFeature'`
5. **Push** para a branch: `git push origin feature/MinhaFeature`
6. **Abra um Pull Request**

### Checklist de PR

- [ ] Código segue o style guide do projeto
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada (se aplicável)
- [ ] Sem conflitos com `main`
- [ ] Build passa sem erros
- [ ] Testes passam

### Code Review

Todos os PRs passam por revisão:
- ✅ Code quality
- ✅ Performance
- ✅ Security
- ✅ Best practices
- ✅ Tests coverage

## 📄 Licença

**Proprietário** - TekFlox © 2025

Todos os direitos reservados. Este software é proprietário e confidencial.

## 👥 Time

**Desenvolvido por:**
- TekFlox Development Team

**Contato:**
- 📧 Email: contato@tekflox.com
- 🌐 Website: https://tekflox.com
- 💼 LinkedIn: [TekFlox](https://linkedin.com/company/tekflox)

## 🙏 Agradecimentos

- React community
- Vite team
- Tailwind CSS creators
- Open source contributors

---

## 📋 Quick Reference Card

### Comandos Essenciais
```bash
npm install              # Instalar dependências
npm run dev             # Frontend (5173)
npm run mock-server     # Backend (3002)
npm test                # Rodar testes
npm run build           # Build produção
```

### URLs Importantes
- Frontend: http://localhost:5173
- Mock API: http://localhost:3002
- Health Check: http://localhost:3002/api/health
- Conversations: http://localhost:5173/conversations

### Estrutura de Dados Principais
```javascript
// Conversa
{
  id, platform, contact, lastMessage, 
  timestamp, status, customerId, orderId
}

// Metadata
{
  aiInsights: [{sender, text, timestamp}],
  manualNotes: "string",
  tags: ["tag1", "tag2"],
  labels: [{text, color}]
}

// Mensagem
{
  id, conversationId, sender, text,
  timestamp, type, actionType
}
```

### Action Types
- `ai_accepted` - Sugestão IA aceita direto (roxo/rosa)
- `ai_edited` - Sugestão IA editada (roxo/rosa + indicador)
- `manual` - Escrita manualmente (azul)

---

## 📸 Screenshots e Wireframes

### Interface de Conversas (Layout)

```
┌──┬────────────────┬──────────────────────────────┬────────────────┐
│🔲│                │                              │                │
│🔲│  Maria Silva   │  Cliente: Oi! Gostaria...   │  👤 PERFIL     │
│🔲│  @mariasilva   │  ┌────────────────────────┐ │  Maria Silva   │
├──┤  🔴 2 minutos │  │  ✨ Sugestão IA:       │ │  @mariasilva   │
│🔲│                │  │  "Olá Maria! Sim..."   │ │  📱 Instagram  │
│🔲│  João Santos   │  │  ⚡92% confiança      │ │                │
│🔲│  joao.santos   │  │                        │ │  💬 CHAT IA    │
├──┤  📘 5 minutos │  │  [Aceitar] [Editar]    │ │  ┌──────────┐ │
│🔲│                │  │  [Manual]              │ │  │AI: 📊...  │ │
│🔲│  Ana Costa     │  └────────────────────────┘ │  │User: Como?│ │
│🔲│  +55 11...     │                              │  └──────────┘ │
│🔲│  💚 Resolvida │  Agente: Sim, temos! 💜      │  [Input...]   │
├──┤                │                              │                │
│  │  [+ mais]      │  [Digite sua mensagem...]    │  🏷️ TAGS      │
│  │                │                              │  #vip #novo   │
└──┴────────────────┴──────────────────────────────┴────────────────┘
 ↑                    ↑                              ↑
VS Code              Lista de                      Painel do
Sidebar              Conversas                     Cliente
```

### Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│  📊 Dashboard                                    [⚙️ Settings]│
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ 📬 Total    │  │ ⏳ Pendentes│  │ ✅ Resolvidas│         │
│  │    125      │  │     23      │  │      87      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Por Plataforma:                                      │  │
│  │  📷 Instagram: 45  📘 Facebook: 50  💬 WhatsApp: 30  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🤖 Taxa de Aceitação IA: 78%                        │  │
│  │  ██████████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Paleta de Cores

```
IA Messages:          Manual Messages:      Backgrounds:
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ Gradient    │      │ Blue Solid  │      │ Purple/Pink │
│ #8b5cf6 →   │      │ #3b82f6     │      │ Gradient    │
│ #ec4899     │      │             │      │ (subtle)    │
└─────────────┘      └─────────────┘      └─────────────┘

Tags:                Labels:              Status:
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ Blue Badge  │      │ Multi-color │      │ 🔴 Pendente │
│ #3b82f6     │      │ (customizable│      │ 🟢 Resolvida│
│             │      │  colors)    │      │ 🟡 Respondida│
└─────────────┘      └─────────────┘      └─────────────┘
```

## 📈 Estatísticas do Projeto

- **Linhas de Código**: ~5,000+ (frontend + backend)
- **Componentes React**: 15+
- **API Endpoints**: 20+
- **Páginas**: 3 (Dashboard, Conversas, Settings)
- **Plataformas Suportadas**: 3 (Instagram, Facebook, WhatsApp)
- **Mock Data**: 5 conversas, 5 clientes, 5 pedidos
- **Test Coverage**: Em progresso (20/49 passando)

## 🌟 Features em Destaque

### 1. Chat com IA (com Resumo Automático)
Implementação completa de chat conversacional com IA integrado ao painel do cliente, com resumo automático da conversa e suporte a perguntas contextuais usando OpenAI + MCP Tools.

### 2. Edição Inline de Notas
Sistema de edição inline sem popups intrusivos, melhorando significativamente a UX do operador.

### 3. Sistema de Metadata Completo
Gestão completa de tags, etiquetas coloridas, notas manuais e chat com IA, tudo persistido por conversa.

### 4. Diferenciação Visual de Mensagens
Código de cores inovador que identifica instantaneamente se a mensagem foi enviada via IA (aceita ou editada) ou manualmente.

### 5. Auto-Reload Completo
Tanto frontend (Vite HMR) quanto backend (Nodemon) com auto-reload, proporcionando experiência de desenvolvimento fluida.

---

**Desenvolvido com 💜 e IA por TekFlox** | Versão 1.0.0 | Última atualização: Outubro 2025
