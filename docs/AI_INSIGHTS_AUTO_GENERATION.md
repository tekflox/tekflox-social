# Chat com IA - Auto-Geração de Resumo + Histórico - Implementado ✅

## 📋 Resumo da Feature

Implementamos sistema completo de Chat com IA (com Resumo Automático) com:
1. ✅ **Auto-geração de resumo** quando abrir conversa
2. ✅ **Spinner de loading** enquanto IA processa
3. ✅ **Log persistente** de toda conversa com IA no banco de dados
4. ✅ **Histórico preservado** por conversa (cada conversa tem seu próprio log)

---

## 🎯 O que foi implementado

### 1. Nova Tabela no Banco de Dados

**Tabela:** `fkc_tekflox_social_ai_insights`

```sql
CREATE TABLE `fkc_tekflox_social_ai_insights` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` varchar(100) NOT NULL,
  `sender` enum('user','ai') NOT NULL,
  `message` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `conversation_id` (`conversation_id`),
  KEY `timestamp` (`timestamp`),
  KEY `idx_conversation_timestamp` (`conversation_id`, `timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Propósito:**
- Armazena TODO o histórico de conversa com IA
- Cada linha = 1 mensagem (user ou ai)
- Indexed por `conversation_id` e `timestamp` para queries rápidas
- Substituiu armazenamento em `wp_options` (mais escalável)

---

### 2. Backend - Modificações

#### Arquivo: `class-ai-routes.php`

**Método `generate_insights()`** - Modificado para salvar no banco:
```php
// OLD: update_option("tekflox_social_ai_insights_{$conversation_id}", json_encode($insights));

// NEW: Salva diretamente na tabela
$wpdb->insert(
    $wpdb->prefix . 'tekflox_social_ai_insights',
    array(
        'conversation_id' => $conversation_id,
        'sender' => 'ai',
        'message' => $summary,
        'timestamp' => current_time('mysql')
    ),
    array('%s', '%s', '%s', '%s')
);
```

**Método `chat_with_ai()`** - Modificado para salvar ambas mensagens:
```php
// Salva mensagem do usuário
$wpdb->insert($insights_table, [
    'conversation_id' => $conversation_id,
    'sender' => 'user',
    'message' => $user_message,
    'timestamp' => current_time('mysql')
]);

// Salva resposta da IA
$wpdb->insert($insights_table, [
    'conversation_id' => $conversation_id,
    'sender' => 'ai',
    'message' => $ai_response,
    'timestamp' => current_time('mysql')
]);
```

#### Arquivo: `class-conversation-routes.php`

**Método `get_metadata()`** - Modificado para ler do banco:
```php
// OLD: json_decode(get_option("tekflox_social_ai_insights_{$conversation_id}", '[]'), true)

// NEW: Query da tabela
$ai_insights_raw = $wpdb->get_results($wpdb->prepare(
    "SELECT sender, message as text, timestamp 
     FROM {$wpdb->prefix}tekflox_social_ai_insights 
     WHERE conversation_id = %s 
     ORDER BY timestamp ASC",
    $conversation_id
), ARRAY_A);
```

**Método `update_metadata()`** - Removido update de aiInsights:
```php
// Comentário adicionado:
// Note: aiInsights are now stored in separate table via AI routes
// No need to update them here
```

---

### 3. Frontend - Modificações

#### Arquivo: `Conversations.jsx`

**1. Novo State para Loading:**
```javascript
const [isLoadingInsights, setIsLoadingInsights] = useState(false);
```

**2. Auto-geração ao abrir conversa:**
```javascript
const loadConversationMetadata = async () => {
  // ... código existente ...
  
  // Se não há insights, gera automaticamente
  if (insights.length === 0) {
    setIsLoadingInsights(true);
    try {
      console.log('[Conversations] 🤖 Generating initial AI insights...');
      const insightResponse = await api.generateAIInsights(state.selectedConversation.id);
      
      const newInsight = {
        sender: 'ai',
        text: insightResponse.data.text || insightResponse.data.summary,
        timestamp: insightResponse.data.timestamp || new Date()
      };
      insights.push(newInsight);
      // Note: Já salvo no backend automaticamente
    } finally {
      setIsLoadingInsights(false);
    }
  }
  
  setAiInsights(insights);
};
```

**3. Chat com IA usando endpoint real:**
```javascript
const sendAIInsightMessage = async () => {
  // Adiciona mensagem do usuário (optimistic UI)
  const updatedInsights = [...aiInsights, userMessage];
  setAiInsights(updatedInsights);
  setAiInsightInput('');
  
  // Mostra loading
  setIsLoadingInsights(true);
  
  // Chama backend AI chat endpoint
  const response = await api.chatWithAI(state.selectedConversation.id, aiInsightInput);
  
  // Adiciona resposta da IA
  const aiResponse = {
    sender: 'ai',
    text: response.data.message,
    timestamp: response.data.timestamp || new Date()
  };
  
  updatedInsights.push(aiResponse);
  setAiInsights(updatedInsights);
  setIsLoadingInsights(false);
  
  // Note: Backend já salvou no banco automaticamente
};
```

**4. UI com Spinner:**
```jsx
<h3 className="font-semibold text-gray-900 flex items-center space-x-2">
  <Sparkles className="w-5 h-5 text-purple-500" />
  <span>AI Insights</span>
  {isLoadingInsights && (
    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
  )}
</h3>

<div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 max-h-96 overflow-y-auto">
  {isLoadingInsights && aiInsights.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-8 space-y-3">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      <p className="text-sm text-gray-600">Gerando análise com IA...</p>
    </div>
  ) : (
    <div className="space-y-3">
      {aiInsights.map((message, index) => (
        // ... renderiza mensagens ...
      ))}
      
      {isLoadingInsights && aiInsights.length > 0 && (
        <div className="flex justify-start">
          <div className="bg-white border border-purple-200 rounded-xl px-3 py-2">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
              <span className="text-sm text-gray-600">Pensando...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )}
</div>
```

#### Arquivo: `api.js`

**Novas funções:**
```javascript
// Gera insights inicial com OpenAI
export const generateAIInsights = async (conversationId) => {
  const { data } = await api.get(`/conversations/${conversationId}/ai/insights`);
  return data;
};

// Chat com IA (com MCP tools)
export const chatWithAI = async (conversationId, message) => {
  const { data } = await api.post(`/conversations/${conversationId}/ai/chat`, { message });
  return data;
};
```

---

## 🔄 Fluxo Completo

### Quando usuário abre uma conversa:

```
1. Frontend: loadConversationMetadata()
   ↓
2. Backend: GET /conversations/:id/metadata
   ↓
3. Backend: Query na tabela ai_insights
   ↓
4. Se vazio:
   ├─ Frontend: setIsLoadingInsights(true) ← SPINNER APARECE
   ├─ Frontend: api.generateAIInsights()
   ├─ Backend: GET /conversations/:id/ai/insights
   ├─ Backend: Chama OpenAI com contexto da conversa
   ├─ Backend: Insere resumo na tabela ai_insights
   ├─ Backend: Retorna insight gerado
   ├─ Frontend: Adiciona insight ao state
   └─ Frontend: setIsLoadingInsights(false) ← SPINNER SOME
   ↓
5. Frontend: Renderiza histórico de insights
```

### Quando usuário faz pergunta à IA:

```
1. Frontend: sendAIInsightMessage()
   ↓
2. Frontend: Adiciona mensagem do usuário (optimistic UI)
   ├─ setIsLoadingInsights(true) ← SPINNER APARECE
   ↓
3. Frontend: api.chatWithAI(conversationId, message)
   ↓
4. Backend: POST /conversations/:id/ai/chat
   ↓
5. Backend: generate_ai_chat_response() com MCP Tools
   ├─ Chama OpenAI
   ├─ OpenAI pode usar ferramentas (search_products, etc)
   ├─ Retorna resposta final
   ↓
6. Backend: Salva ambas mensagens na tabela:
   ├─ INSERT mensagem do user
   ├─ INSERT resposta da AI
   ↓
7. Backend: Retorna resposta
   ↓
8. Frontend: Adiciona resposta da IA ao state
   ├─ setIsLoadingInsights(false) ← SPINNER SOME
   ↓
9. Frontend: Renderiza nova mensagem
```

---

## 🎨 Estados de UI

### Estado 1: Carregando Initial Insight
```
┌─────────────────────────────────────┐
│ ✨ AI Insights           ⟳         │
├─────────────────────────────────────┤
│                                     │
│           ⟳                        │
│   Gerando análise com IA...        │
│                                     │
└─────────────────────────────────────┘
```

### Estado 2: Chat Normal (sem loading)
```
┌─────────────────────────────────────┐
│ ✨ AI Insights                      │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🤖 IA                           │ │
│ │ Análise da conversa: Cliente    │ │
│ │ interessado em produtos...      │ │
│ │ Hoje 14:30                      │ │
│ └─────────────────────────────────┘ │
│                                     │
│             ┌─────────────────────┐ │
│             │ Quantos produtos?   │ │
│             │ Hoje 14:32          │ │
│             └─────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🤖 IA                           │ │
│ │ O cliente mencionou 3 produtos  │ │
│ │ Hoje 14:32                      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
  [Pergunte algo à IA...] [📤]
```

### Estado 3: Aguardando resposta da IA
```
┌─────────────────────────────────────┐
│ ✨ AI Insights           ⟳         │
├─────────────────────────────────────┤
│             ┌─────────────────────┐ │
│             │ Busca produtos      │ │
│             │ Hoje 14:35          │ │
│             └─────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  ⟳ Pensando...                  │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
  [Pergunte algo à IA...] [📤]
```

---

## 📊 Dados no Banco

### Exemplo de log de conversa:

```sql
SELECT * FROM fkc_tekflox_social_ai_insights 
WHERE conversation_id = 'temp_12345_67890' 
ORDER BY timestamp ASC;
```

**Resultado:**
```
+----+----------------------------+--------+--------------------------------------------------+---------------------+
| id | conversation_id            | sender | message                                          | timestamp           |
+----+----------------------------+--------+--------------------------------------------------+---------------------+
|  1 | temp_12345_67890           | ai     | 📊 Análise: Cliente interessado em camisetas.   | 2025-10-11 14:30:00 |
|    |                            |        | Demonstrou interesse em preços...                |                     |
+----+----------------------------+--------+--------------------------------------------------+---------------------+
|  2 | temp_12345_67890           | user   | Quantos produtos ele mencionou?                  | 2025-10-11 14:32:15 |
+----+----------------------------+--------+--------------------------------------------------+---------------------+
|  3 | temp_12345_67890           | ai     | O cliente mencionou 3 produtos específicos...    | 2025-10-11 14:32:18 |
+----+----------------------------+--------+--------------------------------------------------+---------------------+
|  4 | temp_12345_67890           | user   | Busca produtos de camiseta                       | 2025-10-11 14:35:00 |
+----+----------------------------+--------+--------------------------------------------------+---------------------+
|  5 | temp_12345_67890           | ai     | Encontrei 5 produtos de camiseta:                | 2025-10-11 14:35:05 |
|    |                            |        | 1. Camiseta Básica - R$ 49,90...                 |                     |
+----+----------------------------+--------+--------------------------------------------------+---------------------+
```

**Características:**
- ✅ Histórico completo preservado
- ✅ Cada conversa tem seu próprio log isolado
- ✅ Ordenado por timestamp (cronológico)
- ✅ Sender identifica quem falou (user/ai)
- ✅ Escalável (não usa wp_options)

---

## 🧪 Como Testar

### 1. Teste de Auto-geração

**Passos:**
1. Abra o frontend: `http://localhost:5173`
2. Clique em uma conversa que NUNCA teve AI Insights
3. Observe o painel lateral direito "AI Insights"

**Esperado:**
- ✅ Spinner grande aparece: "Gerando análise com IA..."
- ✅ Aguarda 3-8 segundos (OpenAI processando)
- ✅ Aparece mensagem da IA com análise da conversa
- ✅ Spinner desaparece

**Verificar no banco:**
```sql
SELECT * FROM fkc_tekflox_social_ai_insights 
WHERE conversation_id = 'SUA_CONVERSA_ID' 
ORDER BY timestamp DESC LIMIT 1;
```

### 2. Teste de Chat com IA

**Passos:**
1. No mesmo painel "AI Insights", digite: "Quantas mensagens tem?"
2. Clique em enviar (📤)

**Esperado:**
- ✅ Mensagem do usuário aparece imediatamente (azul, direita)
- ✅ Spinner pequeno aparece: "Pensando..."
- ✅ Aguarda 2-5 segundos
- ✅ Resposta da IA aparece (branco, esquerda)
- ✅ Spinner desaparece

**Verificar no banco:**
```sql
SELECT sender, message, timestamp 
FROM fkc_tekflox_social_ai_insights 
WHERE conversation_id = 'SUA_CONVERSA_ID' 
ORDER BY timestamp DESC LIMIT 2;
```

Deve mostrar:
- Linha 1: sender='ai', message=(resposta)
- Linha 2: sender='user', message='Quantas mensagens tem?'

### 3. Teste de Persistência

**Passos:**
1. Faça algumas perguntas à IA
2. Feche a conversa (selecione outra)
3. Abra a mesma conversa novamente

**Esperado:**
- ✅ NÃO mostra spinner
- ✅ Histórico completo aparece instantaneamente
- ✅ Todas mensagens anteriores preservadas
- ✅ Pode continuar conversando (histórico mantido)

### 4. Teste de MCP Tools

**Passos:**
1. Digite: "Busca produtos de camiseta"
2. Aguarde resposta

**Esperado:**
- ✅ IA usa ferramenta `search_products`
- ✅ Retorna lista de produtos reais do WooCommerce
- ✅ Resposta formatada e amigável

**Logs esperados (backend):**
```
TekFlox Social: Assistant requested 1 tool calls
TekFlox Social: Executing tool: search_products with args: {"query":"camiseta"}
TekFlox Social: Tool result: {"products":[...]}
```

### 5. Teste de Múltiplas Conversas

**Passos:**
1. Abra Conversa A, pergunte: "Resumo"
2. Abra Conversa B, pergunte: "Resumo"
3. Volte para Conversa A

**Esperado:**
- ✅ Cada conversa tem seu próprio histórico isolado
- ✅ Logs não se misturam
- ✅ Ao voltar para A, vê histórico de A (não de B)

---

## 📝 Queries Úteis

### Ver todo histórico de uma conversa:
```sql
SELECT 
    sender,
    LEFT(message, 100) as message_preview,
    timestamp
FROM fkc_tekflox_social_ai_insights
WHERE conversation_id = 'temp_12345_67890'
ORDER BY timestamp ASC;
```

### Ver últimas 10 interações de todas conversas:
```sql
SELECT 
    conversation_id,
    sender,
    LEFT(message, 50) as message_preview,
    timestamp
FROM fkc_tekflox_social_ai_insights
ORDER BY timestamp DESC
LIMIT 10;
```

### Contar mensagens por conversa:
```sql
SELECT 
    conversation_id,
    COUNT(*) as total_messages,
    SUM(CASE WHEN sender='user' THEN 1 ELSE 0 END) as user_messages,
    SUM(CASE WHEN sender='ai' THEN 1 ELSE 0 END) as ai_messages
FROM fkc_tekflox_social_ai_insights
GROUP BY conversation_id
ORDER BY total_messages DESC;
```

### Ver conversas mais ativas (mais perguntas à IA):
```sql
SELECT 
    conversation_id,
    COUNT(*) as interactions,
    MIN(timestamp) as first_insight,
    MAX(timestamp) as last_insight
FROM fkc_tekflox_social_ai_insights
GROUP BY conversation_id
ORDER BY interactions DESC
LIMIT 10;
```

### Limpar histórico de uma conversa (se necessário):
```sql
DELETE FROM fkc_tekflox_social_ai_insights
WHERE conversation_id = 'temp_12345_67890';
```

---

## ✅ Checklist de Implementação

- ✅ Tabela `fkc_tekflox_social_ai_insights` criada
- ✅ Migration SQL documentada
- ✅ Backend: `generate_insights()` salva no banco
- ✅ Backend: `chat_with_ai()` salva user + AI messages
- ✅ Backend: `get_metadata()` lê do banco
- ✅ Backend: `update_metadata()` não toca em aiInsights
- ✅ Frontend: State `isLoadingInsights` adicionado
- ✅ Frontend: Auto-geração ao abrir conversa
- ✅ Frontend: Spinner enquanto carrega
- ✅ Frontend: Chat usa endpoint real
- ✅ Frontend: Remove calls desnecessários de updateMetadata
- ✅ API: `generateAIInsights()` adicionado
- ✅ API: `chatWithAI()` adicionado
- ✅ Deploy do backend realizado
- ✅ Documentação completa criada

---

## 🎯 Próximos Passos (Opcionais)

### Melhorias de Performance
1. **Cache de insights** - Cachear resumo inicial por 1 hora
2. **Lazy loading** - Carregar apenas últimas 20 mensagens do histórico
3. **Pagination** - Para conversas muito longas (>100 mensagens)

### Melhorias de UX
1. **Regenerate button** - Botão para regerar resumo
2. **Export chat** - Exportar log de insights para PDF
3. **Search in history** - Buscar em mensagens antigas com IA
4. **Typing indicator** - Mostrar "IA está digitando..."

### Analytics
1. **Track usage** - Quantas perguntas por conversa
2. **Popular questions** - Quais perguntas mais comuns
3. **Tool usage stats** - Quais ferramentas mais usadas
4. **Response times** - Tempo médio de resposta

---

**Implementado em:** 11/10/2025  
**Versão:** 1.0.0  
**Status:** ✅ PRONTO PARA USO
